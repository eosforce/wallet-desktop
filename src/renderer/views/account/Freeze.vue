<template>
  <confirm-modal :show="true" v-bind:title="title" :submitting="submitting" @confirm="submit()" @close="close">
    <div>
      <div class="row" v-if="IS_FEE_MODEL">
        <div class="row__title">{{$t('手续费')}}</div>
        <div class="row__content">{{ fee }}</div>
      </div>

      <div class="row">
        <div class="row__title">{{$t('当前已抵押')}}</div>

        <div class="row__content">
          {{ toAsset(has_freeze_num, wallet_symbol) }}
        </div>

      </div>

      <div class="field">
        <div class="control">
          <input class="input" v-model="selected_value" type="hidden" required />

          <div class="slider_select">
            <div class="slider_select_item" v-bind:class="{'slider_selected_item': item.value == selected_value}" @click="select_value(item.value)" v-for="item in select_list">
              {{ item.text }}
            </div>
          </div>

        </div>
      </div>

      <div class="ipt_item">
        <div class="row">
          <div class="row__title">{{$t('额度')}}</div>
          <div class="row__content">
            <input class="input" v-model="form.FREEZE_NUM.value" type="number" :placeholder="EOST_NUM_PLACEHOLDER" required />
          </div>
        </div>
        <div class="row" v-if="form.FREEZE_NUM.error">
          <div class="row__title">{{$t('')}}</div>
          <p class="help is-danger">
            {{ form.FREEZE_NUM.error }}
          </p>
        </div>
      </div>

      <div class="ipt_item">
        <div class="row">
          <div class="row__title">{{$t('修改后额度')}}</div>
          <div class="row__content">
            {{ toAsset(new_ammount, wallet_symbol) }}
          </div>
        </div>
        <div class="row"  v-show="new_ammount && error_new_ammount">
          <div class="row__title">{{$t('')}}</div>
          <p class="help is-danger">
              {{ error_new_ammount }}
            </p>
        </div>
      </div> 

      <div class="ipt_item">
        <div class="row">
          <div class="row__title">{{$t('密码')}}</div>
          <div class="row__content">
            <input class="input" v-model="form.password.value" type="password" :placeholder="$t('密码')" required />
          </div>
        </div>
        <div class="row" v-if="form.password.error">
          <div class="row__title">{{$t('')}}</div>
          <p class="help is-danger">
            {{ form.password.error }}
          </p>
          <!-- <p class="help is-danger" v-show="password && !password">
                  {{$t('密码')}}
            </p> -->
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
import { is_float, is_int, toAsset, toNumber } from '@/utils/util.js'
export default {
  name: 'Claim',
  data() {
    return {
      selected_value: 0,
      select_list: [
        {value: 0, text: '增加'},
        {value: 1, text: '减少'}
      ],

      form: {
        FREEZE_NUM: {
          value: '',
          formate: new Set(['not_empty', 'is_int']),
          error: ''
        },
        password: {
          value: '',
          formate: new Set(['not_empty']),
          error: ''
        }
      },

      submitting: false,
      content: 'content',
      error:{
        ERROR_TO: ''
      }
    };
  },
  computed: {

    selected_value_txt () {
      return this.select_list.find(item => item.value == this.selected_value).text;
    },

    EOST_NUM_PLACEHOLDER () {
      return this.$t(this.selected_value_txt) + this.wallet_symbol + this.$t('数量');
    },

    new_ammount () {
      return this.selected_value ? toNumber(this.has_freeze_num) - toNumber(this.form.FREEZE_NUM.value) : toNumber(this.has_freeze_num) + toNumber(this.form.FREEZE_NUM.value);
    },

    error_new_ammount () {
      if(this.new_ammount < 0){
        return this.$t('修改后金额不能为负数')
      }
      return '';
    },

    account_name() {
      return this.$route.params.accountName;
    },

    fee () {
      return (this.permissions.filter(item => item.is_have).length * 0.1).toFixed(4) + ' ' + this.wallet_symbol;
    },

    title () {
      return this.$t('抵押');
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

    available () {
      return this.account.info.available;
    },

    walletData() {
      return this.wallet.data || {};
    },

    wallet_symbol () {
      return this.wallet.wallet_symbol;
    },

    IS_FEE_MODEL () {
      return this.wallet.IS_FEE_MODEL;
    },

    vote_and_voteram_freeze () {
        return this.account.vote_and_voteram_freeze;
    },

    has_freeze_num () {
      if(this.vote_back_state){
        return this.account.info.available;
      }
      if(!this.vote_and_voteram_freeze.data){
          return ;
      }
      let rows = this.vote_and_voteram_freeze.data.rows,
          row = rows.length ? rows[0] : null,
          staked = row ? row.staked : 0;
      return toNumber(staked);
    },
    vote_and_voteram_freeze () {
      return this.account.vote_and_voteram_freeze;
    },
    vote_back_state () {
      return this.wallet.vote_back_state;
    },

    ...mapState(['account', 'wallet', 'app']),
  },
  created () {
    this.TO = this.account_name;
  },
  methods: {
    validate_form () {
      const not_empty_validate = (val, key) => {
        if(!val){
          return `${key||''} 不能为空`;
        }
      }

      const check_ecc_public_key = (val, key) => {
        if(!isValidPublic(val, this.wallet_symbol)){
          return `${key} 公钥格式不正确`
        }
      }

      const check_is_int = (val, key) => {
        if(!is_int(val)){
          return this.$t('必须为整数');
        }
      }

      let is_error = true,
          validate_keys = new Map([
            ['not_empty', not_empty_validate],
            ['ecc_public_key', check_ecc_public_key],
            ['is_int', check_is_int]
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
        return null;
      }
      this.submitting = true;

      // { password, walletId, voter, ammount, permission}
      let transfer_res = await this.FREEZE({
        voter: this.account_name, 
        walletId: this.wallet.data.publicKey,
        password: this.form.password.value,
        permission: this.permissions.filter(item => item.is_have)[0].name,
        ammount: this.new_ammount
      })
      .then(result => {
        Message.success(this.$t('抵押成功'));
        this.close();
      })
      .catch(err => {
        Message.error({
          title: this.$t('抵押失败'),
          message: this.$t(err.message || err)
        });
      })
      .then(res => {
        this.submitting = false;
      });

    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    select_value (value) {
      this.selected_value = value;
    },
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      claim: Actions.CLAIM,
      TRANSFER_ACCOUNT: Actions.TRANSFER_ACCOUNT,
      DELETE_ACCOUNT: Actions.DELETE_ACCOUNT,
      DELEGATEBW: Actions.DELEGATEBW,
      FREEZE: Actions.FREEZE
    }),
    toAsset
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
.slider_select{
  width: 100%;
  display: flex;
  background: #fff;
  padding: 0px;
  border-radius: 3px;
  overflow: hidden;
}
.slider_select_item{
  color: #333;
  width: 50%;
  text-align: center;
  font-size: 14px;
  padding: 5px;
}
.slider_selected_item{
  background-color: #409eff;
  color: #fff;
}

</style>

