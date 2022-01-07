import Vue from 'vue';
import App from './App.vue';

document.addEventListener('DOMContentLoaded', () => {
  var app = new Vue({
    el: '#wtd',
    render: h => h(App, {props: {}})
  });
});
