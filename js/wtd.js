;;

(function ($) {
  return $(function () {
    var app = new Vue({
      el: '#wtd',
      template: '\n    <div id="wtd">\n      <p v-show="status===\'loading\'">Loading data...</p>\n      <div v-show="status===\'ok\'" class="wtd__filters">\n        <div><label for="wtd__date_from">From</label><input id="wtd__date_from" v-model="date_from" @keyup.enter="reload()" /></div>\n        <div><label for="wtd__date_to">to</label><input id="wtd__date_to" v-model="date_to"  @keyup.enter="reload()"/></div>\n        <div><label for="wtd__search">Search</label><input id="wtd__date_to" v-model="search" @keyup.enter="reload()" /></div>\n        <div><button @click="reload()">\u2714 Reload</button></div>\n        <div><button @click="reset()">Reset</button></div>\n      </div>\n      <table>\n        <thead>\n          <tr>\n            <th>When</th>\n            <th>Type</th>\n            <th>Details</th>\n          </tr>\n        </thead>\n        <tbody>\n          <tr v-for="entry in entries" :key="entry.wid" @click="selectEntry(entry)" :class="{selected: entry.selected}" >\n            <td >\n              <div class="wtd__timestamp"><span class="wtd__date">{{ entry.timestamp.substr(0,10) }}</span> <span class="wtd__time">{{entry.timestamp.substr(11,8)}}</span></div>\n              <a href @click.prevent.stop="date_from=entry.timestamp;reload();">Since</a>\n            </td>\n            <td>{{entry.severity}} {{entry.type}}</td>\n            <td><message :entry="entry" /></td>\n          </tr>\n        </tbody>\n      </table>\n    </div>\n    ',
      data: function data() {
        return {
          status: 'loading',
          date_from: '',
          date_to: '',
          search: '',

          entries: []
        };
      },

      methods: {
        reset: function reset() {
          this.date_from = '';
          this.date_to = '';
          this.search = '';
          this.reload();
        },
        selectEntry: function selectEntry(entry) {
          entry.selected = !entry.selected;
        },
        reload: function reload() {
          var _this = this;

          this.status = 'loading';

          $.ajax('/admin/reports/wtd/api', { data: {
              date_from: this.date_from,
              date_to: this.date_to,
              search: this.search
            }
          }).then(function (r) {
            console.log("SUCCESS", r);
            _this.entries = r;
            _this.status = 'ok';
          }, function (e) {
            if (e.response && e.response.data) {
              console.log("Error data", e.response.data);
            }
            console.error("ERROR ", e);
          });
        }
      },
      created: function created() {
        this.reload();
      },

      components: {
        message: {
          template: '\n          <div>\n            <div v-show="!showFull">{{shortMessage}}</div>\n            <button v-if="isLong" @click.stop="showFull = !showFull">{{  showFull ? \'Hide\' : \'Show\' }} full</button>\n            <button @click.stop="showVars = !showVars">{{  showVars ? \'Hide\' : \'Show\' }} vars</button>\n            <pre v-if="showFull" class="wtd__full_message">{{this.entry.message}}</pre>\n            <pre v-if="showVars" class="wtd__variables">{{this.entry.variables}}</pre>\n          </div>\n        ',
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
