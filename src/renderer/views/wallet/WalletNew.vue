<template>
  <div class="cover-page">
    <div class="cover-page__content">
      <div class="cover-page__title">
        创建钱包
        <router-link :to="{ name: 'walletImport' }" style="margin-left:20px;color:#aaa">导入钱包文件</router-link>
      </div>
      <form class="cover-page__form" @submit.prevent="!submitting && submit()">
        <div class="field">
          <label class="label">
            明文私钥（警告：请勿导入真实的主网映射私钥！）
            <a class="button is-small is-link is-import" :disabled="isDisabledRandomKey" @click="randomKey()">
            随机生成密钥
            </a>
          </label>
          <div class="control">
            <input v-model="privateKey" class="input" type="text" placeholder="请输入明文私钥" required />
            <p class="help" v-show="publicKey">公钥：{{publicKey}}</p>
            <p class="help is-danger" v-show="privateKey && !publicKey">
              无效的私钥
            </p>
          </div>
        </div>
        <div class="field">
          <p class="help tips" style="color:red">* 私钥请做好备份！</p>
        </div>
        <div class="field">
          <label class="label">设置密码</label>
          <div class="control">
            <input class="input" v-model="password" type="password" placeholder="至少 9 个字符" required />
            <p class="help is-danger" v-show="isSubmited && !isValidPassword">
              密码至少 9 个字符
            </p>
          </div>
        </div>
        <div class="field">
          <label class="label">重复密码</label>
          <div class="control">
            <input class="input" v-model="confirmPassword" type="password" placeholder="重复密码" required />
            <p class="help is-danger" v-show="isSubmited && !isValidConfirmPassword">
              密码不匹配
            </p>
          </div>
        </div>
        <div class="field" style="color:#fff">
          <input type="checkbox" required tabindex="-1" v-model="isAgreeTerm" /> 我已经阅读并同意<a href="#" tabindex="-1">服务及隐私条款</a>
        </div>
        <div class="field is-grouped is-grouped-right">
          <div class="control">
            <a tabindex="-1" class="button cancel-button" :disabled="submitting" @click="!submitting && close()">取消</a>
          </div>
          <div class="control">
            <button type="submit" class="button is-link" :class="{'is-loading': submitting}" :disabled="submitting">下一步</button>
          </div>
        </div>
      </form>
    </div>
    <a class="modal-close is-large cover-page-close" @click="close"></a>
    <confirm-modal title="用户列表" :show="showConfirm" @confirm="close()" :can-close="false" width="400px">
      <div>
        <div>本私钥对应的用户为：</div>
        <ul>
          <li v-for="accountName in accountsList" :key="accountName">{{accountName}}</li>
        </ul>
      </div>
    </confirm-modal>
    <prompt-modal ref="prompt" title="请妥善保存你的私钥" @confirm="prompt" :can-close="false" width="540px">
      <div>
        <div>
          <div>你的私钥</div>
          <div style="color: #f5ebff">{{privateKey}}</div>
        </div>
        <div style="margin-top: 16px;">
          <div style="user-select: none">请手动输入：「我已保存私钥」</div>
          <div>
            <input class="input" v-model="confirmMsg" type="text" placeholder="请手动输入：「我已保存私钥」" />
            <p class="help is-danger" v-show="isDirtyConfirm && !isValidConfirmMsg" style="user-select: none">
              请输入：我已保存私钥
            </p>
          </div>
        </div>
      </div>
    </prompt-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

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
  computed: {
    publicKey() {
      if (!this.isValidPrivateKey) return '';
      return privateToPublic(this.privateKey);
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
      return this.confirmMsg && this.confirmMsg === '我已保存私钥';
    },
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
            });
          })
          .then(result => {
            this.submitting = false;
            Message.success('钱包创建成功');
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
    randomKey() {
      if (this.isDisabledRandomKey) return Promise.reject();
      this.isDisabledRandomKey = true;
      return randomKey()
        .then(privateKey => {
          this.randomPK = privateKey;
          this.privateKey = privateKey;
          this.isDisabledRandomKey = false;
        })
        .catch(() => {
          this.isDisabledRandomKey = false;
        });
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
  float: right;
  width: 110px;
  background: #408ee1;
  color: #fff;
  border: none;
}
.page-terms {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 560px;
  z-index: 999;
  right: 150px;
  left: 150px;
  margin: auto;
}

.ac-head {
  width: 100%;
  height: 60px;
  line-height: 60px;
  color: #ffffff;
  /* float: right; */
  text-align: right;
  background-color: #243e61;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
}

.ac-head span {
  padding: 0 30px;
  cursor: pointer;
}

.ac-body {
  overflow: auto;
  height: 500px;
  background-color: #fafbfd;
  padding-left: 28px;
  padding-right: 26px;
  box-shadow: 4px 0px 54px rgba(3, 0, 0, 0.14);
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.ac-title {
  line-height: 92px;
  font-size: 26px;
  color: #1f304a;
}

.ac-sub-title {
  line-height: 33px;
  color: #5f6065;
  font-size: 16px;
}

.ac-item {
  color: #a8a9ac;
  line-height: 33px;
}

.ac-bonus-body {
  margin-bottom: 50px;
}

.ac-bonus {
  height: 33px;
  line-height: 33px;
  font-size: 16px;
  color: #ffffff;
  background-color: rgba(35, 56, 87, 0.28);
  margin: 5px 0;
}

.ac-bonus span {
  padding: 0 13px;
}

.ac-bonus:nth-child(1) {
  width: 203px;
  background-color: rgba(35, 56, 87, 0.8);
}

.ac-bonus:nth-child(2) {
  width: 263px;
  background-color: rgba(35, 56, 87, 0.6);
}

.ac-bonus:nth-child(3) {
  width: 323px;
  background-color: rgba(35, 56, 87, 0.4);
}

.ac-bonus:nth-child(4) {
  width: 383px;
}

.ac-bonus:nth-child(5) {
  width: 383px;
}

.ac-bonus:nth-child(6) {
  width: 383px;
}

.ac-bonus:nth-child(7) {
  width: 443px;
}

.ac-bonus:nth-child(8) {
  width: 443px;
}

.ac-bonus:nth-child(9) {
  width: 443px;
}

.ac-bonus:nth-child(10) {
  width: 443px;
}

.ac-bonus:nth-child(11) {
  width: 503px;
}
</style> 