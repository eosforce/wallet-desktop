<template>
  <div class="page-menu">
    <div class="header-navbar add-wallet">
      <router-link class="button is-small is-outlined" :to="{name: 'walletNew'}"><i class="add-icon el-icon-plus"></i>{{$t('创建钱包')}}</router-link>
    </div>
    <div class="menu">
      <ul class="menu-list">
        <li v-for="wallet in app.walletList" :key="wallet.publicKey">
          <router-link
            :class="{'is-active': currentWalletId === wallet.publicKey}"
            :to="{name: 'walletDetail', params: { walletId: wallet.publicKey }}"
          >
            <div class="menu-item-title">{{wallet.publicKey.substr(0,7) + '......' + wallet.publicKey.substr(wallet.publicKey.length-6,wallet.publicKey.length)}}</div>
          </router-link>
          <ul>
            <li  v-for="name in wallet.accounts" :key="name">
              <router-link
                :class="{'is-active': currentAccountName=== name}"
                :to="{name: 'accountDetail', params: { walletId: wallet.publicKey, accountName: name }}"
              >
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
import { mapState } from 'vuex';

export default {
  name: 'PageMenu',
  computed: {
    currentAccountName() {
      return this.$route.params && this.$route.params.accountName;
    },
    currentWalletId() {
      return this.$route.params && this.$route.params.walletId;
    },
    ...mapState(['app']),
  },
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
.menu-list a {
  display: flex;
  align-items: center;
  cursor: default;
  padding-left: 16px;
}
.menu-list a:hover .menu-item-handle {
  display: inline;
}
.menu-item-title {
  flex: 1;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

