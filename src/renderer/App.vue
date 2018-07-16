<template>
  <section class="page">
    <router-view name="header"></router-view>
    <router-view></router-view>
    <el-dialog
      title="自动更新"
      :visible.sync="dialogVisible && app.update.startUpdate"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleClose">
      <div>
        <el-progress :text-inside="true" :stroke-width="18" :percentage="app.update.progress" status="success"></el-progress>
        速度：{{app.update.speed}}Kb/s 总大小：{{app.update.total}}Mb
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">后台下载</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import Message from '@/components/Message';
import { mapState } from 'vuex';
import { Actions } from '@/constants/types.constants';

export default {
  name: 'eosforcewallet',
  data() {
    return {
      dialogVisible: true,
    };
  },
  computed: {
    ...mapState(['app']),
  },
  methods: {
    handleClose() {
      this.dialogVisible = false;
    },
  },
  beforeCreate() {
    document.title = this.$t('template.walletTitle', { version: this.$electron.remote.app.getVersion() });
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
