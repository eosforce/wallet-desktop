<template>
  <header class="page-header" style="-webkit-app-region: drag;">
    <div class="brand">
      <router-link class="brand__link" :to="{name: 'dashboard'}"><img src="@/assets/logo.png" class="logo"/></router-link>
    </div>
    <div class="header-navbar">
      <!-- <div class="select">
        <select v-model="chainNet">
          <option :value="k" v-for="(value, k) in chainNets" :key="k">{{value}}</option>
        </select>
      </div> -->
      <div class="select" style="margin-left:10px;">
        <select v-model="nodeValue">
          <option :value="node.value" v-for="node in app.nodeList" :key="node.value">{{node.name}}</option>
        </select>
      </div>
      <div class="select with_lf_line">
        <select v-model="locale" @change="switchLocale(locale)">
          <option :value="k" v-for="(v, k) in locales" :key="k">{{v}}</option>
        </select>
      </div>

      <div class="block" style="display:flex;align-items:center;">
        <div>
          {{$t('出块节点')}}:<span>{{nodeInfo.head_block_producer}}</span>
          {{$t('最新高度')}}:<span>{{nodeInfo.head_block_num}}</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';
import { CHAIN_NETS } from '@/constants/config.constants';

export default {
  name: 'PageHeader',
  data() {
    return {
      showWalletNew: false,
      chainNets: CHAIN_NETS,
      locale: '',
      locales: {
        zh: '中文',
        en: 'English',
        kr: '한국어'
      },
      on_load_info: false,
      on_load_global: false,
      loop_global_info_id: null,
      loopId: null
    };
  },
  computed: {
    nodeInfo() {
      return this.app.currentNodeInfo || {};
    },
    nodeValue: {
      get() {
        return this.app.currentNodeValue;
      },
      set(value) {
        this.fetchNodeInfo({ node: value });
      },
    },
    chainNet: {
      get() {
        return this.app.chainNet;
      },
      set(value) {
        this.switchChainNet({ chainNet: value });
      },
    },
    on_loading_accounts() {
      return this.account.on_load_info;
    },
    is_load_accounts() {
      return this.app.is_load_accounts;
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  created() {
    this.loop();
    this.locale = this.$i18n.locale;
  },
  destroyed(){
    clearTimeout(this.loopId);
    clearTimeout(this.loop_global_info_id);
  },
  methods: {
    switchLocale(locale) {
      localStorage.locale = locale;
      this.$i18n.locale = locale;
    },
    loop() {
      if(this.on_load_info) return ;
      this.on_load_info = true;
      this.loopId = setTimeout(() => {
        this.fetchNodeInfo()
        .then(res => {
          this.on_load_info = false;
          this.loop();
        })
        .catch(err => {
          this.on_load_info = false;
          this.loop();
        });
      }, 3 * 1000);
    },
    async loop_global_info() {
      if(this.on_load_global) return ;
      this.on_load_global = true;

      this.loop_global_info_id = setTimeout(() => {

        this.GET_GLOABLE_INFO()
        .then(res => {
          this.on_load_global = false;
          this.loop_global_info();
        })
        .catch(err => {
          this.on_load_global = false;
          this.loop_global_info();
        });

      }, 10 * 1000);
      
    },
    ...mapActions({
      fetchNodeInfo: Actions.FETCH_NODE_INFO,
      refreshApp: Actions.REFRESH_APP,
      switchChainNet: Actions.SWITCH_CHAIN_NET,
      GET_GLOABLE_INFO: Actions.GET_GLOABLE_INFO,
    }),
  },
};
</script>

<style scoped>
.lg-switch {
  background: #fff;
  color: #000;
  border: none;
  font-size: 14px;
  height: 2.25em;
  margin-bottom: 4px;
  line-height: 32px;
  width: 60px;
  border-radius: 5px;
}

.page-header {
  display: flex;
}

.brand {
  width: 200px;
  display: flex;
  align-items: center;
  height: 60px;
  font-size: 24px;
  padding-left: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.brand__link {
  color: inherit;
  text-decoration: none;
}

.header-navbar {
  display: flex;
  align-items: center;
  flex: 1;
  margin-left: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.refresh {
  cursor: pointer;
}

.page-activity {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 560px;
  z-index: 999;
  right: 50px;
  left: 250px;
  margin: auto;
}

.ac-head {
  width: 100%;
  height: 60px;
  line-height: 60px;
  color: #ffffff;
  /* float: right; */
  text-align: right;
  background-color: #243e61;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.ac-head span {
  padding: 0 30px;
  cursor: pointer;
}

.ac-body {
  overflow: auto;
  height: 500px;
  background-color: #fafbfd;
  padding-left: 28px;
  padding-right: 26px;
  box-shadow: 4px 0px 54px rgba(3, 0, 0, 0.14);
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.ac-title {
  line-height: 92px;
  font-size: 26px;
  color: #1f304a;
}

.ac-sub-title {
  line-height: 33px;
  color: #5f6065;
  font-size: 16px;
}

.ac-item {
  color: #a8a9ac;
  line-height: 33px;
}

.ac-bonus-body {
  margin-bottom: 50px;
}

.ac-bonus {
  height: 33px;
  line-height: 33px;
  font-size: 16px;
  color: #ffffff;
  background-color: rgba(35, 56, 87, 0.28);
  margin: 5px 0;
}

.ac-bonus span {
  padding: 0 13px;
}

.ac-bonus:nth-child(1) {
  width: 203px;
  background-color: rgba(35, 56, 87, 0.8);
}

.ac-bonus:nth-child(2) {
  width: 263px;
  background-color: rgba(35, 56, 87, 0.6);
}

.ac-bonus:nth-child(3) {
  width: 323px;
  background-color: rgba(35, 56, 87, 0.4);
}

.ac-bonus:nth-child(4) {
  width: 383px;
}

.ac-bonus:nth-child(5) {
  width: 383px;
}

.ac-bonus:nth-child(6) {
  width: 383px;
}

.ac-bonus:nth-child(7) {
  width: 443px;
}

.ac-bonus:nth-child(8) {
  width: 443px;
}

.ac-bonus:nth-child(9) {
  width: 443px;
}

.ac-bonus:nth-child(10) {
  width: 443px;
}

.ac-bonus:nth-child(11) {
  width: 503px;
}

.qr-code {
  padding-top: 26px;
  text-align: center;
}

.active {
  border: 1px solid #fff;
  border-radius: 3px;
  text-align: center;
  padding: 0 10px;
  cursor: pointer;
}
</style>
