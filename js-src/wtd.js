(($)=>$(() => {
  var app = new Vue({
    el: '#wtd',
    template: `
    <div id="wtd">
      <p v-show="status==='loading'">Loading data...</p>
      <div v-show="status==='ok'" class="wtd__filters">
        <div><label for="wtd__date_from">From</label><input id="wtd__date_from" v-model="date_from" @keyup.enter="reload()" /></div>
        <div><label for="wtd__date_to">to</label><input id="wtd__date_to" v-model="date_to"  @keyup.enter="reload()"/></div>
        <div><label for="wtd__search">Search</label><input id="wtd__date_to" v-model="search" @keyup.enter="reload()" /></div>
        <div><button @click="reload()">✔ Reload</button></div>
        <div><button @click="reset()">Reset</button></div>
      </div>
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
              <a href @click.prevent.stop="date_from=entry.timestamp;reload();">Since</a>
            </td>
            <td>{{entry.severity}} {{entry.type}}</td>
            <td><message :entry="entry" /></td>
          </tr>
        </tbody>
      </table>
    </div>
    `,
    data() {
      return {
        status: 'loading',
        date_from: '',
        date_to: '',
        search: '',

        entries: [],
      };
    },
    methods: {
      reset() {
        this.date_from = '';
        this.date_to = '';
        this.search = '';
        this.reload();
      },
      selectEntry(entry) {
        entry.selected = !entry.selected;
      },
      reload() {
        this.status = 'loading';

        $.ajax('/admin/reports/wtd/api', { data: {
          date_from: this.date_from,
          date_to: this.date_to,
          search: this.search,
        }
        })
        .then(
          r => {
            console.log("SUCCESS", r);
            this.entries = r;
            this.status = 'ok';
          },
          e => {
            if (e.response && e.response.data) {
              console.log("Error data", e.response.data);
            }
            console.error("ERROR ", e);
          }
        );
      }
    },
    created() {
      this.reload();
    },
    components: {
      message: {
        template: `
          <div>
            <div v-show="!showFull">{{shortMessage}}</div>
            <button v-if="isLong" @click.stop="showFull = !showFull">{{  showFull ? 'Hide' : 'Show' }} full</button>
            <button @click.stop="showVars = !showVars">{{  showVars ? 'Hide' : 'Show' }} vars</button>
            <pre v-if="showFull" class="wtd__full_message">{{this.entry.message}}</pre>
            <pre v-if="showVars" class="wtd__variables">{{this.entry.variables}}</pre>
          </div>
        `,
        data() {
          return {
            showFull: false,
            showVars: false,
          };
        },
        props: ['entry'],
        computed: {
          isLong() {
            return this.entry.message.length > 100;
          },
          shortMessage() {
            if (this.isLong) {
              return this.entry.message.substr(0, 100) + '...';
            }
            return this.entry.message;
          }
        }
      }
    }
  });
}))(jQuery);
