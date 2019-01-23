<template>
  <confirm-modal :show="true" v-bind:title="title" :submitting="submitting" @confirm="submit()" @close="close">
    <div>
      <div class="row" v-if="is_fee_model">
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
        <label class="label">{{$t('抵押给账户')}}</label>
        <div class="control">
          <input class="input" v-model="TO" type="text" :placeholder="$t('抵押给账户')" required />
          <p class="help is-danger" v-show="error.ERROR_TO">
            {{ ERROR_CPU_QUANTITY }}
          </p>
        </div>
      </div>
      <div class="field" v-if="this.TO != this.my_name">
        <label class="label">{{$t('抵押资金赎回给:')}}</label>
        <div class="control">
          <input class="input" v-model="TO" type="hidden" :placeholder="$t('抵押给账户')" required />

          <div class="slider_select">
            <div class="slider_select_item" v-bind:class="{'slider_selected_item': item.value == RELEASE_TO_TO}" @click="select_value(item.value)" v-for="item in TO_LIST">
              {{ item.text }}
            </div>
          </div>

          <p class="help is-danger" v-show="error.ERROR_TO">
            {{ ERROR_CPU_QUANTITY }}
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('抵押CPU')}}</label>
        <div class="control">
          <input class="input" v-model="CPU_QUANTITY" type="text" :placeholder="CPU_NET_PLACEHOLDER" required />
          <p class="help is-danger" v-show="CPU_QUANTITY && ERROR_CPU_QUANTITY">
            {{ ERROR_CPU_QUANTITY }}
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('抵押网络')}}</label>
        <div class="control">
          <input class="input" v-model="NET_QUANTITY" type="text" :placeholder="CPU_NET_PLACEHOLDER" required />
          <p class="help is-danger" v-show="NET_QUANTITY && ERROR_NET_QUANTITY">
            {{ ERROR_NET_QUANTITY }}
          </p>
        </div>
      </div>
      <div class="field">
        <label class="label">{{$t('密码')}}</label>
        <div class="control">
          <input class="input" v-model="password" type="password" :placeholder="$t('密码')" required />
          <p class="help is-danger" v-show="password && !password">
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
import { is_float, toAsset } from '@/utils/util.js'
export default {
  name: 'Claim',
  data() {
    return {
      CPU_QUANTITY: '',
      NET_QUANTITY: '',
      TO: '',
      RELEASE_TO_TO: 0,
      password: '',
      TO_LIST: [
        {value: 0, text: '给自己'},
        {value: 1, text: '给对方'}
      ],
      submitting: false,
      content: 'content',
      error:{
        ERROR_TO: ''
      }
    };
  },
  computed: {
    ERROR_CPU_QUANTITY () {
      if(!this.CPU_QUANTITY) return '';
      if(!is_float(this.CPU_QUANTITY)){
        return this.$t('必须为数字');
      }
    },

    ERROR_NET_QUANTITY () {
      if(!this.NET_QUANTITY) return '';
      if(!is_float(this.NET_QUANTITY)){
        return this.$t('必须为数字');
      }
    },

    CPU_NET_PLACEHOLDER () {
      return this.$t('抵押') + this.wallet_symbol + this.$t('数量');
    },

    my_name() {
      return this.$route.params.accountName;
    },

    fee () {
      return (this.permissions.filter(item => item.is_have).length * 0.1).toFixed(4) + ' ' + this.wallet_symbol;
    },

    title () {
      return this.$t('CPU,网络抵押');
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

    is_fee_model () {
      return this.wallet.is_fee_model;
    },

    ...mapState(['account', 'wallet', 'app']),
  },
  created () {
    this.TO = this.my_name;
  },
  methods: {
    async submit() {
      
      if (!this.CPU_QUANTITY && !this.NET_QUANTITY) {
        Message.error({
          title: this.$t('CPU，网络抵押需至少填写一个抵押数量')
        });
        return null;
      }

      this.submitting = true;

      let transfer_res = await this.DELEGATEBW({
        from: this.my_name, 
        to: this.TO,
        walletId: this.wallet.data.publicKey,
        password: this.password,
        permission: this.permissions.filter(item => item.is_have)[0].name,
        release_to_to: this.RELEASE_TO_TO,
        net_quantity: toAsset(this.NET_QUANTITY || 0, this.wallet_symbol),
        cpu_quantity: toAsset(this.CPU_QUANTITY || 0, this.wallet_symbol)
      })
      .catch(err => {
        return {
          is_error: true,
          message: err.message
        }
      });

      this.submitting = false;
      if (transfer_res.is_error) {
        Message.error({
          title: this.$t('抵押失败'),
          message: this.$t(transfer_res.message),
        });
        return null;
      }
      Message.success(this.$t('抵押成功'));
      this.close();
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    select_value (value) {
      this.RELEASE_TO_TO = value;
    },
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      claim: Actions.CLAIM,
      TRANSFER_ACCOUNT: Actions.TRANSFER_ACCOUNT,
      DELETE_ACCOUNT: Actions.DELETE_ACCOUNT,
      DELEGATEBW: Actions.DELEGATEBW
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

