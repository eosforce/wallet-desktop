<template>
    <div class="modal is-active">
        <div class="cover-page">
            <div class="cover-page__content">
                <div class="cover-page__title">导出私钥</div>
                <form class="cover-page__form" >
                    <!--<div class="field">
                        <label class="label">
                            私钥:
                        </label>
                        <label class="label">
                            {{ privateKey }}
                        </label>
                    </div>-->
                    <div class="field">
                        <label class="label">
                            密码
                        </label>
                        <div class="control">
                            <input class="input" v-model="password" type="password" placeholder="请输入您的钱包密码" required />
                        </div>
                    </div>
                    <div class="field" style="color:#fff">
                        <div style="user-select: none">请妥善保存您的私钥，避免财产损失</div>
                    </div>
                    <div class="field is-grouped is-grouped-right">
                        <div class="control">
                            <a tabindex="-1" class="button cancel-button" @click="close">取消</a>
                        </div>
                        <div class="control">
                            <button type="submit" class="button is-link" @click="submit()">导出</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
  import { mapState } from 'vuex';

  import Message from '@/components/Message';
  import { exportWif, export_raw } from '@/utils/util';
  export default {
    name: "Export",
    data() {
      return {
        privateKey: '',
        password: '',
        exportSuccess: false,
      };
    },
    computed: {
      walletData() {
        return this.wallet.data || {};
      },
      ...mapState(['wallet']),
    },
    methods: {
      submit() {
        let that = this;
        this.privateKey = exportWif(this.password, this.walletData.crypto).then(function (pk) {
          export_raw(pk + '.eosforce', pk);
          Message.success({
            title: `${ '导出成功'}`,
            message: '请妥善保存您的私钥',
          });
          that.close();
        }).catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : '导出失败'}`,
            message: err.message,
          });
        });
      },
      close() {
        this.$router.push({ name: 'accountDetail' });
      },
    },
  };
</script>

<style scoped>

</style>