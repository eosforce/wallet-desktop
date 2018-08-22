<template>
  <div class="page-menu">
    <div class="header-navbar add-wallet">
      <router-link class="button is-small is-outlined" :to="{name: 'walletNew'}"><i class="add-icon el-icon-plus"></i>{{$t('创建钱包')}}</router-link>
    </div>
    <div class="box_load_ct" v-if="is_load_accounts">
      <img src="@/assets/loader/producing.svg" width="20" />
    </div>
    <div class="menu">
      <ul class="menu-list">
        <li v-for="wallet in app.walletList" :key="wallet.publicKey" class="">
          <router-link
            class="key_item"
            :class="{'is-active': currentWalletId === wallet.publicKey}"
            :to="{name: 'walletDetail', params: { walletId: wallet.publicKey }}"
          >
            <div class="menu-item-title">{{wallet.publicKey.substr(0,7) + '......' + wallet.publicKey.substr(wallet.publicKey.length-6,wallet.publicKey.length)}}</div>
          </router-link>
          <ul class="inner_menu_list">
            <li  v-for="name in wallet.accounts" :key="name" class="menu_item">
              <router-link
                class="menu-item-anchor"
                :class="{'is-active': currentAccountName === name && currentWalletId === wallet.publicKey}"
                :to="{name: 'accountDetail', params: { walletId: wallet.publicKey, accountName: name }}"
              >
                <img src="@/assets/user_head.png" class="menu-item-hd">
                <div class="menu-item-title">{{name}}</div>
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { Actions } from '@/constants/types.constants';

export default {
  name: 'PageMenu',
  data () {
    return {
      is_loading: true
    };
  },
  computed: {
    currentAccountName() {
      return this.$route.params && this.$route.params.accountName;
    },
    currentWalletId() {
      return this.$route.params && this.$route.params.walletId;
    },
    on_load_info() {
      return this.account.on_load_info;
    },
    is_load_accounts() {
      return this.app.is_load_accounts;
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  mounted () {
    this.reload();
  },
  methods: {
    async reload () {
      if(this.is_loading) return;
      this.is_loading = true;
      this.FETCH_WALLET_LIST();
      if (this.on_load_info) {
        setTimeout(async () => {
          await this.reload();
          this.is_loading = false;
        }, 1000);
        return;
      }
      setTimeout(async () => {
        await this.reload();
        this.is_loading = false;
      }, 5000);
    },
    ...mapActions({
      FETCH_WALLET_LIST: Actions.FETCH_WALLET_LIST
    })
  }
};
</script>

<style scoped>
.page-menu {
  width: 200px;
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  overflow: auto;
}
.menu-list {
  margin-bottom: 100px;
}
.menu-list>li{
  margin-top: 20px;
}
.menu-item-anchor{
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-left: 10px;
  height: 32px;
}
.menu-list .menu-item-anchor:hover{
  background-color: #38496B;
}
.menu-list a:hover .menu-item-handle {
  display: inline;
}
.menu-list a.key_item:hover{
  background-color: #38496B;
}
.menu-item-title {
  flex: 1;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.menu-item-hd{
  height: 12px;
  width: 12px;
  margin-right: 12px;
}
</style>

