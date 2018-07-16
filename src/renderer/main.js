import Vue from 'vue';
import VueI18n from 'vue-i18n';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import App from '@/App';
import router from '@/router';
import store from '@/store';
import messages from '@/messages';

import setMenu from '@/menu';
import { formatNumber, timestamp, hostname } from '@/utils/filter';

Vue.use(ElementUI);
Vue.use(VueI18n);
setMenu();

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.config.productionTip = false;

Vue.filter('formatNumber', formatNumber);
Vue.filter('timestamp', timestamp);
Vue.filter('hostname', hostname);

if (!localStorage.locale) {
  if (navigator.language === 'zh-CN') {
    localStorage.locale = 'zh';
  } else {
    localStorage.locale = 'en';
  }
}

const i18n = new VueI18n({
  locale: localStorage.locale || 'zh',
  messages,
});

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  i18n,
  template: '<App/>',
}).$mount('#app');
