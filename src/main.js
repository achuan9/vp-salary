import Vue from 'vue';
import '@babel/polyfill';
import App from './App.vue';
import router from './router';

import "./element-ui";


Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');
