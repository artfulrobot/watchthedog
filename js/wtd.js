;;

(function ($) {
  return $(function () {
    var app = new Vue({
      el: '#wtd',
      template: '\n    <div id="wtd">\n      <p v-show="status===\'loading\'">Loading data...</p>\n      <div v-show="status===\'ok\'" class="wtd__filters">\n        <div><label for="wtd__date_from">From</label><input id="wtd__date_from" v-model="date_from" @keyup.enter="newQuery()" /></div>\n        <div><label for="wtd__date_to">to</label><input id="wtd__date_to" v-model="date_to"  @keyup.enter="newQuery()"/></div>\n        <div><label for="wtd__search">Search</label><input id="wtd__date_to" v-model="search" @keyup.enter="newQuery()" /></div>\n        <div class="button"><button @click="reset()">Reset</button></div>\n        <!-- This should not be needed. <div class="button"><button @click="newQuery()">\u2714 Reload</button></div>-->\n      </div>\n      <p>\n        <input type="checkbox"\n          v-model="auto_load_new_entries"\n          id="wtd__auto_load"\n          @change="reloadSoon"\n        /><label for="wtd__auto_load">Load new entries automatically.</label>\n        <input type="checkbox" v-model="auto_show_new_entries" id="wtd__auto_show" /><label for="wtd__auto_show">Show new entries automatically.</label>\n        <span v-show="newEntries.length > 0">New data since search. <a href @click.prevent="showNewEntries()">Show new entries ({{newEntries.length}})</a></span>\n      </p>\n      <table>\n        <thead>\n          <tr>\n            <th>When</th>\n            <th>Type</th>\n            <th>Details</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr v-for="entry in entries" :key="entry.wid" @click="selectEntry(entry)" :class="{selected: entry.selected}" >\n            <td >\n              <div class="wtd__timestamp"><span class="wtd__date">{{ entry.timestamp.substr(0,10) }}</span> <span class="wtd__time">{{entry.timestamp.substr(11,8)}}</span></div>\n              <a href @click.prevent.stop="date_from=entry.timestamp;newQuery(true);">Since</a> |\n              <a href @click.prevent.stop="date_to=entry.timestamp;newQuery(true);">Until</a>\n            </td>\n            <td :class="\'wtd__type severity-\' + entry.severity">{{entry.type}}</td>\n            <td><message :entry="entry" /></td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n    ',
      data: function data() {
        return {
          status: 'loading',
          date_from: '',
          date_to: '',
          search: '',

          entries: [],
          auto_load_new_entries: true,
          auto_show_new_entries: false,
          max: 0,
          newEntries: [],
          background_load: false,
          timer: false
        };
      },

      methods: {
        reset: function reset() {
          this.date_from = '';
          this.date_to = '';
          this.search = '';
          this.newQuery(true);
        },
        selectEntry: function selectEntry(entry) {
          entry.selected = !entry.selected;
        },
        showNewEntries: function showNewEntries() {
          this.entries = this.newEntries.concat(this.entries);
          this.newEntries = [];
        },
        newQuery: function newQuery() {
          this.status = 'loading';
          this.background_load = false;
          this.reload(true);
        },
        reload: function reload(showNow) {
          var _this = this;

          if (!showNow) {
            this.background_load = true;
          }

          $.ajax('/admin/reports/wtd/api', { data: {
              date_from: this.date_from,
              date_to: this.date_to,
              search: this.search,
              max: showNow ? false : this.max
            }
          }).then(function (r) {
            if (showNow) {
              _this.entries = r.entries;
              _this.max = r.max;
              _this.newEntries = [];
            } else if (_this.background_load) {
              if (_this.max < r.max) {
                // Store new entries.
                _this.max = r.max;
                // Add the new entries to the start of our newEntries list.
                _this.newEntries = r.entries.concat(_this.newEntries);
                if (_this.auto_show_new_entries) {
                  _this.showNewEntries();
                }
              }
            }
            _this.status = 'ok';
            _this.timer = false;
            _this.reloadSoon();
          }, function (e) {
            if (e.response && e.response.data) {
              console.log("Error data", e.response.data);
            }
            console.error("ERROR ", e);
          });
        },
        reloadSoon: function reloadSoon() {
          console.log("reloadSoon", this.timer, this.auto_load_new_entries);
          if (!this.timer && this.auto_load_new_entries) {
            // There is no current timer, and we are supposed to be auto loading,
            // so set up a timeout.
            var vm = this;
            this.timer = setTimeout(function () {
              vm.reload(false);
            }, 2000);
          }
          if (this.timer && !this.auto_load_new_entries) {
            // There is an existing timer and we are not supposed to be auto loading,
            // cancel it.
            clearTimeout(this.timer);
            this.timer = false;
          }
        }
      },
      created: function created() {
        this.newQuery();
      },

      components: {
        message: {
          template: '\n          <div>\n            <div :class="{wtd__full_message: true, full: showFull}" v-html="this.entry.message"></div>\n            <button @click.stop="showFull = !showFull">{{  showFull ? \'Hide\' : \'Show\' }} full</button>\n            <button @click.stop="showVars = !showVars">{{  showVars ? \'Hide\' : \'Show\' }} vars</button>\n            <pre v-if="showVars" class="wtd__variables">{{this.entry.variables}}</pre>\n          </div>\n        ',
          data: function data() {
            return {
              showFull: false,
              showVars: false
            };
          },

          props: ['entry'],
          computed: {
            isLong: function isLong() {
              return this.entry.message.length > 100;
            },
            shortMessage: function shortMessage() {
              if (this.isLong) {
                return this.entry.message.substr(0, 100) + '...';
              }
              return this.entry.message;
            }
          }
        }
      }
    });
  });
})(jQuery);
//# sourceMappingURL=wtd.js.map
