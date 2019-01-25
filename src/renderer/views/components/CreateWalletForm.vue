<template>
  <div class="cover-page">
    <div class="cover-page__content" v-bind:style="form_top">

      <div class="cover-page__title"  v-if="with_title">
        {{$t('创建钱包')}}
        <router-link :to="{ name: 'walletImport' }" style="margin-left:20px;color:#aaa">{{$t('导入私钥')}}</router-link>
      </div>

      <form class="cover-page__form" @submit.prevent="!submitting && submit()">
        <div class="field">
          <label class="label">
            {{$t('明文私钥')}}
            <a v-if="with_random" style="position: relative;margin-left: 8px;top: -4px;margin-bottom: 4px;width: auto;" class="button is-small is-link is-import" :disabled="isDisabledRandomKey" @click="randomKey()">
            {{$t('随机生成私钥')}}
            </a>
          </label>
          <div class="control">
            <input v-model="privateKey" class="input" type="text" :placeholder="$t('请输入明文私钥')" required />
            <p class="help" v-show="publicKey">{{$t('公钥')}}：{{publicKey}}</p>
            <p class="help is-danger" v-show="privateKey && !publicKey">
              {{$t('无效的私钥')}}
            </p>
          </div>
        </div>
        <div class="field">
          <p class="help tips" style="color:red">{{$t('* 私钥请做好备份！')}}</p>
        </div>
        <div class="field">
          <label class="label">{{$t('设置密码')}}</label>
          <div class="control">
            <input class="input" v-model="password" type="password" :placeholder="$t('至少 9 个字符')" required />
            <p class="help is-danger" v-show="isSubmited && !isValidPassword">
              {{$t('至少 9 个字符')}}
            </p>
          </div>
        </div>
        <div class="field">
          <label class="label">{{$t('重复密码')}}</label>
          <div class="control">
            <input class="input" v-model="confirmPassword" type="password" :placeholder="$t('重复密码')" required />
            <p class="help is-danger" v-show="isSubmited && !isValidConfirmPassword">
              {{$t('密码不匹配')}}
            </p>
          </div>
        </div>
        <div class="field" style="color:#fff">
          <input type="checkbox" required tabindex="-1" v-model="isAgreeTerm" /> {{$t('我已经阅读并同意')}}<a href="static/term.html" target="_blank" tabindex="-1">{{$t('服务及隐私条款')}}</a>
        </div>
        <div class="field is-grouped is-grouped-right">
          <div class="control">
            <a tabindex="-1" class="button cancel-button" :disabled="submitting" @click="!submitting && close()">{{$t('取消')}}</a>
          </div>
          <div class="control">
            <button type="submit" class="button is-link" :class="{'is-loading': submitting}" :disabled="submitting">{{$t('下一步')}}</button>
          </div>
        </div>
      </form>
    </div>
    <a  v-if="with_close" class="modal-close is-large cover-page-close" @click="close"></a>
    <confirm-modal :title="$t('用户列表')" :show="showConfirm" @confirm="close()" :can-close="false" width="400px">
      <div>
        <div>{{$t('本私钥对应的用户为：')}}</div>
        <ul>
          <li v-for="accountName in accountsList" :key="accountName">{{accountName}}</li>
        </ul>
      </div>
    </confirm-modal>
    <prompt-modal ref="prompt" :title="$t('请妥善保存你的私钥')" @confirm="prompt" :can-close="false" width="540px">
      <div>
        <div>
          <div>{{$t('你的私钥')}}</div>
          <div style="color: rgb(47, 46, 47)">{{privateKey}}</div>
        </div>
        <div style="margin-top: 16px;">
          <div style="user-select: none">{{$t('请手动输入：「我已保存私钥」')}}</div>
          <div>
            <input class="input" v-model="confirmMsg" type="text" :placeholder="$t('请手动输入：「我已保存私钥」')" />
            <p class="help is-danger" v-show="isDirtyConfirm && !isValidConfirmMsg" style="user-select: none">
              {{$t('请输入：我已保存私钥')}}
            </p>
          </div>
        </div>
      </div>
    </prompt-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import PromptModal from '@/components/PromptModal';
import { Actions } from '@/constants/types.constants';
import { randomKey, privateToPublic } from '@/utils/util';
import { isValidPassword, isValidPrivate, isValidAccountName } from '@/utils/rules';

export default {
  name: 'WalletNew',
  data() {
    return {
      privateKey: '',
      password: '',
      confirmPassword: '',
      isSubmited: false,
      isAgreeTerm: false,
      isDisabledRandomKey: false,
      submitting: false,

      randomPK: '',
      confirmMsg: '',
      isDirtyConfirm: false,
      walletId: '',
      showConfirm: false,
      showConfirmPK: false,
      accountsList: [],
    };
  },
  props: {
    with_close: {
      type: Boolean,
      default () {
        return true;
      }
    },
    with_title: {
      type: Boolean,
      default () {
        return true;
      }
    },
    with_random: {
      type: Boolean,
      default () {
        return true;
      }
    },
    margin_top: {
      type: Number,
      default () {
        return 64;
      }
    }
  },
  computed: {
    form_top () {
      return {
        marginTop: (this.margin_top || 64) + 'px'
      }
    },
    publicKey() {
      if (!this.isValidPrivateKey) return '';
      return privateToPublic(this.privateKey, this.symbol);
    },
    isValidAccountName() {
      return this.accountName && isValidAccountName(this.accountName);
    },
    isValidPrivateKey() {
      return this.privateKey && isValidPrivate(this.privateKey);
    },
    isValidPassword() {
      return this.password && isValidPassword(this.password);
    },
    isValidConfirmPassword() {
      return this.confirmPassword && this.password === this.confirmPassword;
    },
    isValidConfirmMsg() {
      return (
        this.confirmMsg && (this.confirmMsg === '我已保存私钥' || this.confirmMsg === 'I have saved the private key')
      );
    },
    symbol () {
      return this.wallet.wallet_symbol;
    },
    ...mapState(['wallet'])
  },
  methods: {
    submit() {
      this.isSubmited = true;
      if (this.isValidPrivateKey && this.isValidPassword && this.isValidConfirmPassword && this.isAgreeTerm) {
        return new Promise((resolve, reject) => {
          if (this.randomPK === this.privateKey) {
            resolve(this.$refs.prompt.show());
          } else {
            resolve();
          }
        })
          .then(() => {
            this.submitting = true;
            return this.newWallet({
              privateKey: this.privateKey,
              password: this.password,
              symbol: this.symbol
            });
          })
          .then(result => {
            this.submitting = false;
            Message.success(this.$t('钱包创建成功'));
            this.walletId = result.publicKey;
          })
          .catch(err => {
            this.submitting = false;
            Message.error(err && err.message);
            return Promise.reject(err);
          })
          .then(() => {
            return this.fetchAccountList({ publicKey: this.publicKey, noset: true });
          })
          .then(result => {
            if (!result.length) {
              this.close();
            } else {
              this.accountsList = result;
              this.showConfirm = true;
            }
          });
      }
    },
    close() {
      if (this.walletId) {
        this.$router.push({ name: 'walletDetail', params: { walletId: this.walletId } });
      } else {
        this.$router.push({ name: 'dashboard' });
      }
    },
    prompt(resolve) {
      this.isDirtyConfirm = true;
      if (this.isValidConfirmMsg) {
        resolve();
      }
    },
    async randomKey() {
      if (this.isDisabledRandomKey) return Promise.reject();
      this.isDisabledRandomKey = true;
      let private_key = await randomKey().catch(error => {
          return {
            is_error: true
          }
      });
      if(!private_key.error){
        this.randomPK = private_key;
        this.privateKey = private_key;
        this.isDisabledRandomKey = false;
      }else{
        this.isDisabledRandomKey = false;
      }
    },
    ...mapActions({
      newWallet: Actions.NEW_WALLET,
      fetchAccountList: Actions.FETCH_ACCOUNT_LIST,
    }),
  },
  components: {
    ConfirmModal,
    PromptModal,
  },
};
</script>
<style scoped>
.link-button {
  font-size: 12px;
}
.is-import {
  font-size: 14px;
  margin-bottom: 8px;
  width: 110px;
  background: #408ee1;
  color: #fff;
  border: none;
}
</style>