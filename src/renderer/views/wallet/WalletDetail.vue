<template>
  <div class="page-body">
    <page-menu />
    <router-view></router-view>
    <div class="dashboard-body" v-if="$route.name === 'walletDetail'">
      <div class="box">
          <div class="publickey" style="line-height: 27px;">
            公钥：{{walletData.publicKey}}
            <span class="is-grouped">
              <a style="margin-left:15px" class="button is-small is-outlined" @click="exportWallet()">导出钱包</a>
            </span>
            <span class="refresh fr el-icon-refresh" @click="refresh()"></span>
          </div>
          <div class="dec">
            <p><span style="color:#f00">*特别提醒*：</span></p>
            <p>1. 本钱包只提供创建公私钥服务，您需要进一步创建用户名才能做链上操作。</p>
            <p>2. 请向已经拥有链上用户名的第三方提出创建申请，向其提供您的公钥(EOS...) 和期望的用户名，切勿提供您的私钥（5...）。</p>
            <p>3. 创建用户名交易需要花费第三方0.1个EOS，创建交易成功后，用户名会自动显示在左侧。</p>
          </div>
      </div>
    </div>
    <router-view name="modal"></router-view>
  </div>
</template>

<script>
import PageMenu from '@/views/layout/PageMenu';
import { mapGetters, mapActions, mapState } from 'vuex';

import Message from '@/components/Message';
import { Getters, Actions } from '@/constants/types.constants';

export default {
  name: 'WalletDetail',
  computed: {
    ...mapGetters({
      accountList: Getters.ACCOUNT_LIST,
    }),
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['account', 'wallet']),
  },
  methods: {
    initWallet(id) {
      this.fetchWallet({ id: id || this.$route.params.walletId }).catch(err => {
        Message.error(`账户列表加载失败： ${err && err.message}`);
        return Promise.reject(err);
      });
    },
    refresh() {
      this.refreshWallet();
    },
    // 导出钱包存储文件
    exportWallet() {
      this.fetchWallet({ id: this.$route.params.walletId, mutation: false }).then(data => {
        const filename = `UTC--${new Date().toISOString()}--${data.publicKey}`;
        const file = new File([JSON.stringify(data)], filename, { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
      });
    },
    ...mapActions({
      fetchWallet: Actions.FETCH_WALLET,
      refreshWallet: Actions.REFRESH_WALLET,
    }),
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.walletId !== from.params.walletId) {
      this.initWallet(to.params.walletId);
    }
    next();
  },
  created() {
    if (this.$router.currentRoute.name !== 'accountDetail') {
      this.initWallet();
    }
  },
  components: {
    PageMenu,
  },
};
</script>

<style scoped>
.dashboard-body {
  padding: 24px;
  overflow: auto;
  flex: 1;
}
.refresh {
  line-height: 27px;
  cursor: pointer;
  font-size: 20px;
}
.dec {
  margin-top: 20px;
  font-size: 14px;
}
</style>

