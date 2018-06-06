<template>
  <header class="page-header" style="-webkit-app-region: drag;">
    <div class="brand">
      <router-link class="brand__link" :to="{name: 'dashboard'}"><img src="@/assets/logo.png" class="logo"/></router-link>
    </div>
    <div class="header-navbar">
      <div class="select">
        <select v-model="nodeValue">
          <option :value="node.value" v-for="node in app.nodeList" :key="node.value">{{node.name}}</option>
        </select>
      </div>
      <div class="block">
          最新高度:<span>{{nodeInfo.head_block_num}}</span>
          出块节点:<span>{{nodeInfo.head_block_producer}}</span>
          <span class="refresh" @click="refreshApp()"><img src="@/assets/refresh.png"></span>
      </div>

    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';

export default {
  name: 'PageHeader',
  data() {
    return {
      showWalletNew: false,
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
    ...mapState(['app']),
  },
  created() {
    const loop = () => {
      // setTimeout(() => {
      //   this.fetchNodeInfo({ node: this.nodeValue }).then(() => {
      //     loop()
      //   })
      // }, 3000)
    };

    loop();
  },
  methods: {
    ...mapActions({
      fetchNodeInfo: Actions.FETCH_NODE_INFO,
      refreshApp: Actions.REFRESH_APP,
    }),
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
}

.brand {
  width: 200px;
  display: flex;
  align-items: center;
  height: 49px;
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
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.refresh {
  cursor: pointer;
}
</style>
