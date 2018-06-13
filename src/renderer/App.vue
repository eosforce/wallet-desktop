<template>
  <section class="page">
    <router-view name="header"></router-view>
    <router-view></router-view>
  </section>
</template>

<script>
import Message from '@/components/Message';

import { Actions } from '@/constants/types.constants';

export default {
  name: 'eosforcewallet',
  beforeCreate() {
    this.$store.dispatch(Actions.INIT_APP).catch(err => {
      Message.error({
        title: '初始化错误',
        message: '节点获取失败',
      });
      return Promise.reject(err);
    });
  },
};
</script>

<style lang="scss">
@import '~@/styles/index.scss';

.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
}
</style>
