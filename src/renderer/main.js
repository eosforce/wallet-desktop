import Vue from 'vue';

import App from './App';
import router from './router';
import store from './store';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import setMenu from '@/menu';
import { formatNumber, timestamp } from '@/utils/filter';

Vue.use(ElementUI);
setMenu();

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

Vue.filter('formatNumber', formatNumber);
Vue.filter('timestamp', timestamp);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>',
}).$mount('#app');
