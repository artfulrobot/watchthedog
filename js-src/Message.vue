<template>
          <div>
            <div :class="{wtd__full_message: true, full: showFull}" v-html="this.entry.message"></div>
            <button @click.stop="showFull = !showFull">{{  showFull ? 'Hide' : 'Show' }} full</button>
            <button @click.stop="showVars = !showVars">{{  showVars ? 'Hide' : 'Show' }} vars</button>
            <a :href="'/admin/reports/event/' + entry.wid" target="_blank" >Watchdog</a>
            <pre v-if="showVars" class="wtd__variables">{{this.entry.variables}}</pre>
          </div>
</template>

<script>
export default {
  props: ['entry'],
  data: function() {
    return {
      showFull: false,
      showVars: false,
    };
  },
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
};

</script>
