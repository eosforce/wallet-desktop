import Vue from 'vue';
import { DatePicker } from 'element-ui';

import App from './App';
import router from './router';
import store from './store';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import { Mutations, Actions, Getters } from '@/constants/types.constants';
import setMenu from '@/menu';

Vue.use(ElementUI);
setMenu();

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

Vue.use(DatePicker);

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app');
