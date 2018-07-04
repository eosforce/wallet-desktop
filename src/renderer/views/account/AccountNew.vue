<template>
  <div class="modal is-active">
    <div class="cover-page">
      <div class="cover-page__content">
        <div class="cover-page__title">创建用户</div>
        <form class="cover-page__form" @submit.prevent="!submitting && confirmInfo()">
          <div class="field">
            <div class="static-label">
              创建人<span class="static-text">{{creatorAccountName}}</span>
            </div>
          </div>
          <div class="field">
            <label class="label">用户公钥</label>
            <div class="control">
              <input class="input" v-model="publicKey" type="text" placeholder="将要创建账户的公钥" required />
              <p class="help is-danger" v-show="publicKey && !isValidPublicKey">
                无效的公钥
              </p>
            </div>
          </div>
          <div class="field">
            <label class="label">用户名称</label>
            <div class="control">
              <input class="input" v-model="accountName" type="text" placeholder="a-y，1-5 的 12 位以内字符" required />
              <p class="help is-danger" v-show="accountName && !isValidAccountName">
                用户名只能包含 .12345abcdefghijklmnopqrstuvwxyz，并且在 12 位以内
              </p>
            </div>
          </div>
          <div class="field" v-if="accountCreator.publicKey">
            <p class="help tips">* 手续费 {{app.fee}}</p>
          </div>
          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <a tabindex="-1" class="button cancel-button" :disabled="submitting" @click="!submitting && close()">取消</a>
            </div>
            <div class="control">
              <button type="submit" class="button is-link" :class="{'is-loading': this.accountCreator && this.accountCreator.account && submitting}" :disabled="submitting">确认</button>
            </div>
          </div>
        </form>
      </div>
      <a class="modal-close is-large cover-page-close" @click="close"></a>
    </div>
    <confirm-modal :show="showConfirm" :submitting="modalSubmitting" @confirm="submit()" @close="toggle('showConfirm', false)">
      <div>
        <div class="row">
          <div class="row__title">交易名称</div>
          <div class="row__content">创建用户</div>
        </div>
        <div class="row">
          <div class="row__title">创建人</div>
          <div class="row__content">{{creatorAccountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">用户公钥</div>
          <div class="row__content">{{publicKey}}</div>
        </div>
        <div class="row">
          <div class="row__title">用户名称</div>
          <div class="row__content">{{accountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">手续费</div>
          <div class="row__content">0.1 EOS</div>
        </div>
        <div class="row">
          <div class="row__title">输入密码</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" placeholder="请输入创建人的钱包密码" required />
          </div>
        </div>
      </div>
    </confirm-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import { Actions } from '@/constants/types.constants';
import { isValidAccountName, isValidPublic } from '@/utils/rules';

export default {
  name: 'AccountNew',
  data() {
    return {
      publicKey: '',
      accountName: '',
      accountCreator: '',
      submitting: false,
      modalSubmitting: false,
      showConfirm: false,
      password: '',
    };
  },
  computed: {
    isValidAccountName() {
      return this.accountName && isValidAccountName(this.accountName);
    },
    isValidPublicKey() {
      return this.publicKey && isValidPublic(this.publicKey);
    },
    creatorAccountName() {
      return this.$route.params.accountName;
    },
    nodeList() {
      return this.app.nodeList;
    },
    ...mapState(['app']),
  },
  methods: {
    confirmInfo() {
      if (this.isValidAccountName && this.isValidPublicKey && (this.accountCreator || this.creatorAccountName)) {
        if (this.creatorAccountName) {
          this.showConfirm = true;
        }
      }
    },
    submit() {
      Promise.resolve()
        .then(() => {
          this.modalSubmitting = true;
          return this.newAccount({
            password: this.password,
            publicKey: this.publicKey,
            accountName: this.accountName,
            creator: this.creatorAccountName,
          });
        })
        .then(result => {
          Message.success('用户创建成功');
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : '创建账户失败'}`,
            message: err.message,
          });
          this.submitting = false;
          this.modalSubmitting = false;
          return Promise.reject(err);
        })
        .then(() => {
          this.fetchWalletList();
          this.$router.push({ name: 'accountDetail', params: { accountName: this.creatorAccountName } });
        });
    },
    close() {
      history.length ? this.$router.go(-1) : this.$router.push({ name: 'walletDetail' });
    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val);
    },
    ...mapActions({
      newAccount: Actions.NEW_ACCOUNT,
      fetchWalletList: Actions.FETCH_WALLET_LIST,
    }),
  },
  components: {
    ConfirmModal,
  },
};
</script>
