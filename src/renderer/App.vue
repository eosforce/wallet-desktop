<template>
  <section class="page">
    <router-view name="header"></router-view>
    <router-view></router-view>
    <el-dialog
      v-bind:title="auto_update"
      :visible.sync="dialogVisible && app.update.startUpdate"
      width="50%"
      :close-on-click-modal="false"
      :before-close="handleClose">
      <div>
        <el-progress :text-inside="true" :stroke-width="18" :percentage="app.update.progress" status="success"></el-progress>
        {{ this.$t('速度') }}：{{app.update.speed}}Kb/s {{ this.$t('总大小') }}：{{app.update.total}}Mb
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ this.$t('后台下载') }}</el-button>
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
      auto_update: this.$t('自动更新')
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
    // alert(this.$t("密码错误"));
    document.title = this.$t('template.walletTitle', { version: this.$electron.remote.app.getVersion() });
    this.$store.dispatch(Actions.INIT_APP).catch(err => {
      Message.error({
        title: this.$t('初始化错误'),
        message: this.$t('节点获取失败'),
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
