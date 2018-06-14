<template>
  <div class="page-body">
    <page-menu />
    <router-view></router-view>
    <div class="dashboard-body" v-if="$route.name === 'walletDetail'">
      <div class="box">
          <div class="publickey" style="line-height: 27px;">
            公钥：{{walletData.publicKey}}
            <span class="is-grouped">
              <router-link style="margin-left:15px" class="button is-small is-outlined" :to="{name: 'accountNew'}">创建用户</router-link>
              <a style="margin-left:15px" class="button is-small is-outlined" @click="exportWallet()">导出钱包</a>
            </span>
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
</style>

