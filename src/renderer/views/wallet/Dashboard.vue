<template>
  <router-view />
</template>

<script>
import { mapActions, mapState } from 'vuex';

import { Actions, Getters } from '@/constants/types.constants';

export default {
  name: 'dashboard',
  computed: {
    ...mapState(['app']),
  },
  methods: {
    redirect() {
      return this.initApp()
        .then(() => {
          return this.fetchWalletList();
        })
        .then(() => {
          const walletIdList = this.app.walletIdList;
          if (!walletIdList.length) {
            this.$router.push({ name: 'walletNew' });
          } else if (walletIdList.length === 1) {
            this.$router.push({ name: 'walletDetail', params: { walletId: walletIdList[0] } });
          } else {
            // @TODO 自动跳转默认钱包
            this.$router.push({ name: 'walletDetail', params: { walletId: walletIdList[0] } });
          }
        });
    },
    ...mapActions({
      fetchWalletList: Actions.FETCH_WALLET_LIST,
      initApp: Actions.INIT_APP,
    }),
  },
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'dashboard') {
      this.redirect();
    }
    next();
  },
  created() {
    this.redirect();
  },
};
</script>

<style scoped>
.page-body {
  display: flex;
  flex: 1;
}
</style>


