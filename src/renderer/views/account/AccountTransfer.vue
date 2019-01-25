<template>
  <confirm-modal :show="true" v-bind:title="title" :submitting="submitting" @confirm="submit()" @close="close">
    <div>
      <div class="row" v-if="is_fee_model">
        <div class="row__title">{{$t('手续费')}}</div>
        <div class="row__content">{{ fee }}</div>
      </div>
      <!-- <div class="row">
        <div class="row__title">{{$t('转让权限')}}</div>
        <div class="row__content">
          <span v-for="item in permissions" v-if="item.is_have">{{ item.name }} </span>
        </div>
      </div> -->
      <div class="field">
        <label class="label">{{$t('Owner公钥')}}</label>
        <div class="control">
          <input class="input" v-model="form.owner_public_key.value" type="text" :placeholder="$t('Owner公钥')" required />
          <p class="help is-danger" v-show="form.owner_public_key.error">
            {{$t('无效的公钥')}}
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('Active公钥')}}</label>
        <div class="control">
          <input class="input" v-model="form.active_public_key.value" type="text" :placeholder="$t('Active公钥')" required />
          <p class="help is-danger" v-show="form.active_public_key.error">
            {{$t('无效的公钥')}}
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('密码')}}</label>
        <div class="control">
          <input class="input" v-model="form.password.value" type="password" :placeholder="$t('密码')" required />
          <p class="help is-danger" v-show="form.password.error">
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
import { isValidPublic, filter_public_key } from '@/utils/rules.js'
export default {
  name: 'Claim',
  data() {
    return {
      public_key: '',
      owner_public_key: '',
      active_public_key: '',
      password: '',
      submitting: false,
      content: 'content',
      form: {
        owner_public_key: {
          value: '',
          formate: new Set(['not_empty', 'ecc_public_key']),
          error: ''
        },
        active_public_key: {
          value: '',
          formate: new Set(['not_empty', 'ecc_public_key']),
          error: ''
        },
        password: {
          value: '',
          formate: new Set(['not_empty']),
          error: ''
        }
      },
      error: {
        owner_public_key: '',
        active_public_key: '',
        password: ''
      }
    };
  },
  computed: {
    my_name() {
      return this.$route.params.accountName;
    },
    fee () {
      return '0.2' + ' ' + this.wallet_show_symbol;
      // return (this.permissions.filter(item => item.is_have).length * 0.1).toFixed(4) + ' ' + this.wallet_show_symbol;
    },
    title () {
      return this.$t('确认转让用户名')  + '?';
    },
    baseInfo() {
      return this.account.info.baseInfo || {permissions: []};
    },
    permissions () {
      let res = [];
      this.baseInfo.permissions.map(item => {
        let key = '';
        let is_have = item.required_auth.keys.find(item => {
          key = item.key;
          if(item.key == this.wallet.data.publicKey){
            return true;
          }
        });
        res.push({
          name: item.perm_name,
          key,
          is_have: is_have ? true : false
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
    available () {
      return this.account.info.available;
    },
    walletData() {
      return this.wallet.data || {};
    },
    wallet_symbol () {
      return this.wallet.wallet_symbol;
    },
    wallet_show_symbol () {
      return this.wallet.wallet_show_symbol;
    },
    is_fee_model () {
      return this.wallet.is_fee_model;
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  mounted () {
    this.init_base_key();
  },
  methods: {
    init_base_key () {
      this.permissions.map(item => {
        this.form[item.name + '_public_key']['value'] = item.key;
      });
    },
    validate_form () {
      const not_empty_validate = (val, key) => {
        if(!val){
          return `${key} 不能为空`;
        }
      }

      const check_ecc_public_key = (val, key) => {
        if(!isValidPublic(val, this.wallet_symbol)){
          return `${key} 公钥格式不正确`
        }
      }

      let is_error = true,
          validate_keys = new Map([
            ['not_empty', not_empty_validate],
            ['ecc_public_key', check_ecc_public_key]
          ]);

      for(let _key in this.form){
        let item = this.form[_key];
        let validate_items = item.formate;
        item.error = '';
        for(let vk of validate_keys.keys()){
          if(validate_items.has(vk)){
            let check_res = validate_keys.get(vk)(item.value);
            if(check_res){
              item.error = check_res;
              is_error = false;
            }
          }
        }
      }

      return is_error;
    },
    async submit() {
      if(!this.validate_form()){
        return ;
      }

      this.submitting = true;
      let transfer_res = await this.TRANSFER_ACCOUNT({
        name: this.my_name, 
        owner_public_key: filter_public_key(this.form.owner_public_key.value, this.wallet_symbol),
        active_public_key: filter_public_key(this.form.active_public_key.value, this.wallet_symbol),
        walletId: this.wallet.data.publicKey,
        password: this.form.password.value,
        permissions: this.permissions.filter(item => item.is_have).map(item => item.name),
        wallet_symbol: this.wallet_symbol
      });
      this.submitting = false;
      if (transfer_res.is_error) {
        Message.error({
          title: this.$t('用户名转让失败'),
          message: this.$t(transfer_res.message),
        });
        return null;
      }
      Message.success(this.$t('用户名转让成功'));
      let next_params = await this.DELETE_ACCOUNT({account: this.my_name, publicKey: this.wallet.data.publicKey});
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

