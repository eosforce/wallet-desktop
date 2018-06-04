<template>
  <div class="page-body">
    <page-menu />
    <router-view></router-view>
    <div class="dashboard-body" v-if="$route.name === 'walletDetail'">
      <div class="box">
          <div class="img-box">
            <img src="@/assets/border.png" class="lt"/>
            <img src="@/assets/border.png" class="rt"/>
            <img src="@/assets/border.png" class="lb"/>
            <img src="@/assets/border.png" class="rb"/>
            <img src="@/assets/lace.png" class="lt2"/>
            <img src="@/assets/lace.png" class="rb2"/>
          </div>
          <div class="publickey" style="line-height: 27px;">
            公钥：{{walletData.publicKey}}
            <span class="is-grouped">
                <router-link style="margin-left:15px" class="button is-small is-outlined" :to="{name: 'accountNew'}">创建用户</router-link>
            </span>
          </div>
      </div>
    </div>
    <router-view name="modal"></router-view>
  </div>
</template>

<script>
import PageMenu from '@/views/layout/PageMenu'
import { mapGetters, mapActions, mapState } from 'vuex'

import Message from '@/components/Message'
import { Getters, Actions } from '@/constants/types.constants'

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
    initWallet() {
      this.fetchWallet({ id: this.$route.params.walletId }).catch(err => {
        Message.error(`账户列表加载失败： ${err && err.message}`)
        return Promise.reject(err)
      })
    },
    ...mapActions({
      fetchWallet: Actions.FETCH_WALLET,
    }),
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.walletId !== from.params.walletId) {
      this.initWallet()
    }
    next()
  },
  created() {
    if (this.$router.currentRoute.name !== 'accountDetail') {
      this.initWallet()
    }
  },
  components: {
    PageMenu,
  },
}
</script>

<style scoped>
.dashboard-body {
  padding: 24px;
  overflow: auto;
  flex: 1;
}
</style>

