<template>
    <div id="wtd">
      <p v-show="status==='loading'">Loading data...</p>
      <div v-show="status==='ok'" class="wtd__filters">
        <div><label for="wtd__date_from">From</label><input
          id="wtd__date_from" v-model="date_from" @keyup.enter="newQuery()"
                              @input="searchChanged = true"
          /></div>
        <div><label for="wtd__date_to">to</label><input id="wtd__date_to" v-model="date_to"                           
                                                                          @input="searchChanged = true"
           @keyup.enter="newQuery()"/></div>
        <div><label for="wtd__type">Type</label><input id="wtd__type"  @input="searchChanged = true" v-model="type_search" @keyup.enter="newQuery()" /></div>
        <div><label for="wtd__search">Search</label><input id="wtd__search"  @input="searchChanged = true" v-model="search" @keyup.enter="newQuery()" /></div>
        <div><label for="wtd__limit">Limit</label>
          <select v-model="limit" id="wtd__limit" @change.prevent="newQuery()">
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="200">200</option>
            <option value="1000">1000</option>
          </select>
        </div>
        <div class="button"><button class="reset" @click="reset()">Reset</button></div>
        <div class="button"><button class="update" @click="newQuery()" :disabled="!searchChanged" >Update</button></div>
      </div>
      <div v-show="errors">
        <ul>
          <li v-for="e in errors" >{{e}}</li>
        </ul>
      </div>
      <p>
        <input type="checkbox"
          v-model="auto_load_new_entries"
          id="wtd__auto_load"
          @change="reloadSoon"
        /><label for="wtd__auto_load">Load new entries automatically.</label>
        <input type="checkbox" v-model="auto_show_new_entries" id="wtd__auto_show" /><label for="wtd__auto_show">Show new entries automatically.</label>
        <span v-show="newEntries.length > 0">New data since search. <a href @click.prevent="showNewEntries()">Show new entries ({{newEntries.length}})</a></span>
      </p>
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>

          <tr v-for="entry in entries" :key="entry.wid" @click="selectEntry(entry)" :class="{selected: entry.selected}" >
            <td >
              <div class="wtd__timestamp"><span class="wtd__date">{{ entry.timestamp.substr(0,10) }}</span> <span class="wtd__time">{{entry.timestamp.substr(11,8)}}</span></div>
              <a href @click.prevent.stop="date_from=entry.timestamp;newQuery(true);">Since</a> |
              <a href @click.prevent.stop="date_to=entry.timestamp;newQuery(true);">Until</a> |
              <a href @click.prevent.stop="setTimeAround(entry.timestamp)">Around</a>
            </td>
            <td :class="'wtd__type severity-' + entry.severity">{{entry.type}}</td>
            <td><message :entry="entry" /></td>
          </tr>

        </tbody>
      </table>
    </div>
</template>
<script>
import Message from './Message.vue';

export default {
    data() {
      return {
        searchChanged: false,
        status: 'loading',
        date_from: '',
        date_to: '',
        search: '',
        type_search: '',
        limit: '20',
        errors: [],

        entries: [],
        auto_load_new_entries: true,
        auto_show_new_entries: false,
        max: 0,
        newEntries: [],
        background_load: false,
        timer: false,
      };
    },
    methods: {
      reset() {
        this.date_from = '';
        this.date_to = '';
        this.limit = '20';
        this.search = '';
        this.type_search = '';
        this.newQuery(true);
      },
      setTimeAround(timestamp) {
        var t = new Date(timestamp).getTime();
        this.date_from = (new Date(t - 3 * 60 * 1000)).toISOString().replace(/^(\d+-\d\d-\d\d)T(\d\d:\d\d).*$/, '$1 $2');
        this.date_to   = (new Date(t + 3 * 60 * 1000)).toISOString().replace(/^(\d+-\d\d-\d\d)T(\d\d:\d\d).*$/, '$1 $2');
        newQuery(true);
      },
      selectEntry(entry) {
        entry.selected = !entry.selected;
      },
      showNewEntries() {
        this.entries = this.newEntries.concat(this.entries);
        this.newEntries = [];
      },
      newQuery() {
        this.searchChanged = false;
        this.status = 'loading';
        this.background_load = false;
        this.reload(true);
      },
      reload(showNow) {

        if (!showNow) {
          this.background_load = true;
        }

        fetch('/admin/reports/wtd/api?'
          + (new URLSearchParams({
            date_from: this.date_from,
            date_to: this.date_to,
            search: this.search,
            type_search: this.type_search,
            limit: this.limit,
            max: showNow ? false : this.max
          })).toString(),
          {
            method: 'GET',
          })
        .then(response => response.json())
        .then(
          r => {
            console.log(r);
            this.errors = r.errors;
            if (showNow) {
              this.entries = r.entries;
              this.max = r.max;
              this.newEntries = [];
            }
            else if (this.background_load) {
              if (this.max < r.max) {
                // Store new entries.
                this.max = r.max;
                // Add the new entries to the start of our newEntries list.
                this.newEntries = r.entries.concat(this.newEntries);
                if (this.auto_show_new_entries) {
                  this.showNewEntries();
                }
              }
            }
            this.status = 'ok';
            this.timer = false;
            this.reloadSoon();
          },
          e => {
            if (e.response && e.response.data) {
              console.log("Error data", e.response.data);
            }
            console.error("ERROR ", e);
          }
        );
      },
      reloadSoon() {
        console.log("reloadSoon", this.timer, this.auto_load_new_entries);
        if (!this.timer && this.auto_load_new_entries) {
          // There is no current timer, and we are supposed to be auto loading,
          // so set up a timeout.
          var vm = this;
          this.timer = setTimeout(function() {vm.reload(false);}, 2000);
        }
        if (this.timer && !this.auto_load_new_entries) {
          // There is an existing timer and we are not supposed to be auto loading,
          // cancel it.
          clearTimeout(this.timer);
          this.timer = false;
        }
      },
    },
    created() {
      this.newQuery();
    },
  components: { Message }
}
</script>
