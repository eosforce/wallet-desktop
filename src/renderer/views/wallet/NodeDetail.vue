<template>
  <div class="page-body">
    <page-menu />
    <router-view></router-view>
    <div class="dashboard-body" v-if="$route.name === 'NodeDetail'">
      <div class="box">
        <table class="table data-table">
          <thead>
            <tr>
              <th>节点名</th>
              <th>地址</th>
              <th>IP</th>
              <th>端口</th>
              <th>最新高度</th>
              <th>不可逆块高度</th>
              <th>ping</th>
            </tr>
          </thead>
          <tbody>
            <tr :value="node.value" v-for="node in app.nodeList" :key="node.value">
              <td>-</td>
              <td>{{node.name.substr(0,4)}}</td>
              <td>{{node.value}}</td>
              <td>{{node.value.split(":")[2]}}</td>
              <td>{{nodeInfo.head_block_num}}</td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
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
  name: 'NodeDetail',
  data() {
    return {
      showDeleteWallet: false,
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
    ...mapGetters({
      accountList: Getters.ACCOUNT_LIST,
    }),
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['account', 'wallet', 'app']),
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
    ...mapActions({
      fetchWallet: Actions.FETCH_WALLET,
      refreshWallet: Actions.REFRESH_WALLET,
      deleteWallet: Actions.DELETE_WALLET,
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

