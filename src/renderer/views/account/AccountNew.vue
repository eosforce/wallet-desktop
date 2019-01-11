<template>
  <div class="modal is-active">
    <div class="cover-page">
      <div class="cover-page__content">
        <div class="cover-page__title">{{$t('创建用户')}}</div>
        <form class="cover-page__form" @submit.prevent="!submitting && confirmInfo()">
          <div class="field">
            <div class="static-label">
              {{$t('创建人')}}<span class="static-text">{{creatorAccountName}}</span>
            </div>
          </div>
          <div class="field">
            <label class="label">{{$t('Owner权限公钥')}}</label>
            <div class="control">
              <input class="input" v-model="OwnerKey" type="text" :placeholder="$t('拥有owner权限的公钥')" required />
              <p class="help is-danger" v-show="OwnerKey && !isValidOwnerKey">
                {{$t('无效的公钥')}}
              </p>
            </div>
          </div>

          <div class="field">
            <label class="label">{{$t('Active权限公钥')}}</label>
            <div class="control">
              <input class="input" v-model="ActiveKey" type="text" :placeholder="$t('拥有Active权限的公钥')" required />
              <p class="help is-danger" v-show="ActiveKey && !isValidActiveKey">
                {{$t('无效的公钥')}}
              </p>
            </div>
          </div>

          <div class="field">
            <label class="label">{{$t('用户名称')}}</label>
            <div class="control">
              <input class="input" v-model="accountName" type="text" :placeholder="$t('用户名只能包含 .12345abcdefghijklmnopqrstuvwxyz，并且在 12 位以内')" required />
              <p class="help is-danger" v-show="accountName && !isValidAccountName">
                {{$t('用户名只能包含 .12345abcdefghijklmnopqrstuvwxyz，并且在 12 位以内')}}
              </p>
            </div>
          </div>
          <div class="field" v-if="accountCreator.publicKey">
            <p class="help tips">{{$t('template.fee', {fee: app.fee})}}</p>
          </div>
          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <a tabindex="-1" class="button cancel-button" :disabled="submitting" @click="!submitting && close()">{{$t('取消')}}</a>
            </div>
            <div class="control">
              <button type="submit" class="button is-link" :class="{'is-loading': this.accountCreator && this.accountCreator.account && submitting}" style="width: auto;" :disabled="submitting">{{$t('确认创建账户')}}</button>
            </div>
          </div>
        </form>
      </div>
      <a class="modal-close is-large cover-page-close" @click="close"></a>
    </div>
    <confirm-modal :show="showConfirm" :submitting="modalSubmitting" @confirm="submit()" @close="toggle('showConfirm', false)">
      <div>
        <div class="row">
          <div class="row__title">{{$t('交易名称')}}</div>
          <div class="row__content">{{$t('创建用户')}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('创建人')}}</div>
          <div class="row__content">{{creatorAccountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('Owner权限公钥')}}</div>
          <div class="row__content">{{OwnerKey}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('Active权限公钥')}}</div>
          <div class="row__content">{{ActiveKey}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('用户名称')}}</div>
          <div class="row__content">{{accountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('手续费')}}</div>
          <div class="row__content">0.1 EOSC</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('输入密码')}}</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" :placeholder="$t('请输入创建人的钱包密码')" required />
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
      OwnerKey: '',
      ActiveKey: '',
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
    isValidOwnerKey() {
      return this.OwnerKey && isValidPublic(this.OwnerKey);
    },
    isValidActiveKey() {
      return this.ActiveKey && isValidPublic(this.ActiveKey);
    },
    creatorAccountName() {
      return this.$route.params.accountName;
    },
    nodeList() {
      return this.app.nodeList;
    },
    baseInfo() {
      return this.account.info.baseInfo || {permissions: []};
    },
    permissions () {
      let res = [];
      this.baseInfo.permissions.map(item => {
        let is_have = item.required_auth.keys.find(item => {
          if(item.key == this.wallet.data.publicKey){
            return true;
          }
        });
        is_have = is_have ? true : false;
        res.push({
          name: item.perm_name,
          is_have
        })
      });
      return res;
    },
    has_owner () {
      return this.permissions.find(item => {
        if(item.name == 'owner' && item.is_have){
          return true;
        }
      })
    },
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  methods: {
    confirmInfo() {
      if (this.isValidAccountName && this.isValidOwnerKey && this.isValidActiveKey && (this.accountCreator || this.creatorAccountName)) {
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
            OwnerKey: this.OwnerKey,
            ActiveKey: this.ActiveKey,
            accountName: this.accountName,
            creator: this.creatorAccountName,
            walletId: this.walletData.publicKey,
            permission: this.permissions.filter(item => item.is_have)[0].name
          });
        })
        .then(result => {
          Message.success(this.$t('用户创建成功'));
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : this.$t('创建账户失败')}`,
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
