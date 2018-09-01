<template>
  <confirm-modal :show="true" v-bind:title="title" :submitting="submitting" @confirm="submit()" @close="close">
    <div>
      <div class="row">
        <div class="row__title">{{$t('手续费')}}</div>
        <div class="row__content">{{ fee }}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('转让权限')}}</div>
        <div class="row__content">
          <span v-for="item in permissions" v-if="item.is_have">{{ item.name }} </span>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('接受方公钥')}}</label>
        <div class="control">
          <input class="input" v-model="public_key" type="text" :placeholder="$t('请输入接受方公钥')" required />
          <p class="help is-danger" v-show="public_key && !public_key">
            {{$t('无效的公钥')}}
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('密码')}}</label>
        <div class="control">
          <input class="input" v-model="password" type="password" :placeholder="$t('请输入密码')" required />
          <p class="help is-danger" v-show="public_key && !public_key">
            {{$t('密码')}}
          </p>
        </div>
      </div>
    </div>
  </confirm-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import PromptModal from '@/components/PromptModal';
import { Actions } from '@/constants/types.constants';
import { isValidPublic } from '@/utils/rules.js'
export default {
  name: 'Claim',
  data() {
    return {
      public_key: '',
      password: '',
      submitting: false,
      content: 'content'
    };
  },
  computed: {
    my_name() {
      return this.$route.params.accountName;
    },
    fee () {
      return (this.permissions.filter(item => item.is_have).length * 0.1).toFixed(4) + ' EOS';
    },
    title () {
      return '确认转让用户名' + this.$route.params.accountName + '?';
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
    async submit() {
      if (!this.public_key) {
        Message.error({
          title: this.$t('请填写接受方公钥')
        });
        return null;
      }
      if (!isValidPublic(this.public_key)) {
        Message.error({
          title: this.$t('请填写正确的公钥格式')
        });
        return null;
      }
      if (this.public_key == this.wallet.data.publicKey) {
        Message.error({
          title: this.$t('不能转让用户到自己')
        });
        return null;
      }
      this.submitting = true;
      let transfer_res = await this.TRANSFER_ACCOUNT({
        name: this.my_name, 
        publick_key: this.public_key,
        walletId: this.wallet.data.publicKey,
        password: this.password,
        permissions: this.permissions.filter(item => item.is_have).map(item => item.name)
      });
      this.submitting = false;
      if (transfer_res.is_error) {
        Message.error({
          title: this.$t('用户名转让失败'),
          message: transfer_res.message,
        });
        return null;
      }
      Message.success(this.$t('用户名转让成功'));
      let next_params = await this.DELETE_ACCOUNT({account: this.my_name, publicKey: this.wallet.data.publicKey});
      console.log('next_params is ' + next_params);
      if(next_params){
        this.$router.push({
          name: 'accountTransfer',
          params: {
            accountName: next_params.account,
            walletId: next_params.publicKey
          }
        });
      }
      this.close();
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      claim: Actions.CLAIM,
      TRANSFER_ACCOUNT: Actions.TRANSFER_ACCOUNT,
      DELETE_ACCOUNT: Actions.DELETE_ACCOUNT
    }),
  },
  components: {
    ConfirmModal,
    PromptModal
  },
};
</script>

<style>

.graphic {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}
.graphic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.graphic img {
  width: 60px;
}

</style>

