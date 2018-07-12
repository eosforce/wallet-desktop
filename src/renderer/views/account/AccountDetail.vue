<template>
  <div class="dashboard-body">
    <account-overview />
    <div class="tabs">
      <div
        class="tab fl"
        @click="toggleTab(tab.tabKey)"
        :class="{'is-active': currentTab === tab.tabKey}"
        v-for="tab in tabMap"
        :key="tab.tabKey">
        <a class="min-img">
          <img :src="require(`@/assets/${tab.img1}`)" class="two hide">
          <img :src="require(`@/assets/${tab.img2}`)" class="one">
          {{tab.tabName}}<span v-show="tab.tabKey === 'BpList'">{{$t('template.version', {version: version})}}</span>
        </a>
      </div>
      <span class="refresh fr el-icon-refresh" @click="refreshList()"></span>
    </div>
    <div :is="currentTab" ref="cTab" keep-alive></div>
    <router-view name="modal"></router-view>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';
import AccountOverview from '@/views/account/AccountOverview';
import TransferRecord from '@/views/account/TransferRecord';
import BpList from '@/views/account/BpList';
import Myvote from '@/views/account/Myvote';
import AlternateNode from '@/views/account/AlternateNode';
import RateInstructions from '@/views/account/RateInstructions';
import TokenList from '@/views/account/TokenList';

export default {
  name: 'AccountDetail',
  data() {
    return {
      tabMap: [
        { tabName: this.$t('超级节点'), tabKey: 'BpList', img1: 'node.png', img2: 'node_w.png' },
        { tabName: this.$t('候选节点'), tabKey: 'AlternateNode', img1: 'laternode.png', img2: 'laternode_w.png' },
        { tabName: this.$t('我的投票'), tabKey: 'Myvote', img1: 'vote.png', img2: 'vote_w.png' },
        { tabName: this.$t('我的 Token'), tabKey: 'TokenList', img1: 'token.png', img2: 'token_w.png' },
        { tabName: this.$t('交易记录'), tabKey: 'TransferRecord', img1: 'exchange.png', img2: 'exchange_w.png' },
        { tabName: this.$t('资产说明'), tabKey: 'RateInstructions', img1: 'assets.png', img2: 'assets_w.png' },
      ],
      currentTab: 'BpList', // currentTab 用于标识当前触发的子组件,
    };
  },
  computed: {
    version() {
      return this.account.bpsTable[0] && this.account.bpsTable[0].version;
    },
    accountName() {
      return this.$route.params.accountName;
    },
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['wallet', 'account']),
  },
  methods: {
    initAccount() {
      return this.initApp().then(() => {
        this.fetchAccout({ accountName: this.accountName });
      });
    },
    ...mapActions({
      fetchAccout: Actions.FETCH_ACCOUNT,
      fetchWallet: Actions.FETCH_WALLET,
      initApp: Actions.INIT_APP,
      refreshTransferrecord: Actions.GET_TRANSFER_RECORD,
      refreshBpsList: Actions.GET_BPS_TABLE,
      getTokenList: Actions.GET_TOKEN_LIST,
    }),
    toggleTab: function(tab) {
      this.currentTab = tab; // tab 为当前触发标签页的组件名
    },
    refreshList: function() {
      if (this.currentTab === 'TokenList') {
        this.getTokenList({ accountName: this.accountName });
      } else {
        this.refreshTransferrecord({ accountName: this.accountName });
        this.refreshBpsList();
      }
    },
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.accountName !== from.params.accountName) {
      this.initAccount();
    }
    next();
  },
  created() {
    if (this.walletData.publicKey) {
      return this.initAccount();
    } else {
      this.fetchWallet({ id: this.$route.params.walletId }).then(() => {
        return this.initAccount();
      });
    }
  },
  components: {
    AccountOverview,
    TransferRecord,
    BpList,
    Myvote,
    AlternateNode,
    RateInstructions,
    TokenList,
  },
};
</script>

<style scoped>
.dashboard-body {
  padding: 24px;
  overflow: auto;
  background: #ebeff2;
  flex: 1;
}
.refresh {
  height: 40px;
  line-height: 40px;
  margin-right: 25px;
  font-size: 20px;
  cursor: pointer;
}
.refresh img {
  width: 15px;
  margin: 12px 20px;
}
</style>

