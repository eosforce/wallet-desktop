<template>
  <div class="modal is-active">
    <div class="cover-page">
      <div class="cover-page__content">
        <div class="cover-page__title">{{tokenSymbol}} {{$t('转账')}}</div>
        <form class="cover-page__form" @submit.prevent="confirmInfo()">
          <div class="field">
            <label class="label">
              {{$t('收款用户')}}
            </label>
            <div class="control">
              <input v-model="toAccountName" class="input" type="text" :placeholder="$t('请输入收款用户名')" required />
              <p class="help is-danger" v-show="toAccountName && !isValidToAccountName">
                {{$t('用户名只能包含 .12345abcdefghijklmnopqrstuvwxyz，并且在 12 位以内')}}
              </p>
            </div>
          </div>
          <div class="field">
            <label class="label">
              {{$t('转账金额')}}
            </label>
            <div class="control">
              <input v-model="amount" min="0" class="input" type="number" :step="`${0.1 ** precision}`" :placeholder="$t('template.symbol', {symbol: tokenSymbol})" required />
              <p class="help is-danger" v-show="amount && !isValidAmount">
                {{$t('template.precision', {p: precision})}}
              </p>
            </div>
          </div>
          <div class="field">
            <label class="label">
              {{$t('备注')}}
            </label>
            <div class="control">
              <input v-model="memo" min="0" class="input" type="text" :placeholder="$t('备注')" max-length="255"/>
            </div>
          </div>
          <div class="field">
            <p class="help tips">{{$t('template.fee', {fee: app.fee})}}</p>
          </div>
          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <a tabindex="-1" class="button cancel-button" @click="close">{{$t('取消')}}</a>
            </div>
            <div class="control">
              <button type="submit" class="button is-link">{{$t('下一步')}}</button>
            </div>
          </div>
        </form>
      </div>
      <a class="modal-close is-large cover-page-close" @click="close"></a>
    </div>
    <confirm-modal :show="showConfirm" :submitting="submitting" @confirm="submit()" @close="toggle('showConfirm', false)">
      <div>
        <div class="row">
          <div class="row__title">{{$t('交易名称')}}</div>
          <div class="row__content">{{$t('转账')}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('转出用户')}}</div>
          <div class="row__content">{{fromAccountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('收款用户')}}</div>
          <div class="row__content">{{toAccountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('转账金额')}}</div>
          <div class="row__content">{{amount | formatNumber({p: precision, showSymbol: true, symbol: tokenSymbol})}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('手续费')}}</div>
          <div class="row__content">{{app.fee}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('输入密码')}}</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" :placeholder="$t('请输入转出用户的钱包密码')" required />
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
import { isValidAccountName, isValidAmount } from '@/utils/rules';
import { toNumber } from '@/utils/util';

export default {
  name: 'Transfer',
  data() {
    return {
      toAccountName: '',
      amount: '',
      submitting: false,
      memo: '',

      fee: 0.01,
      password: '',
      showConfirm: false,
    };
  },
  computed: {
    fromAccountName() {
      return this.$route.params.accountName;
    },
    tokenSymbol() {
      return this.$route.params.symbol || 'EOS';
    },
    precision() {
      return this.$route.params.precision !== undefined ? this.$route.params.precision : '4';
    },
    isValidToAccountName() {
      return this.toAccountName && isValidAccountName(this.toAccountName);
    },
    isValidAmount() {
      return this.amount && isValidAmount(this.amount, { precision: this.precision });
    },
    baseInfo() {
      return this.account.info.baseInfo || {permissions: []};
    },
    permissions() {
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
      if (this.isValidToAccountName && this.isValidAmount) {
        const isOver =
          this.tokenSymbol === 'EOS'
            ? toNumber(this.account.info.available) - toNumber(this.amount) - 0.1 - this.fee
            : toNumber(this.account.info.available) - 0.1 - this.fee;

        if (isOver < 0.00001) {
          return this.$confirm(
            this.$t('您的可用余额将降低到0.1以下，可能不够缴纳后续交易的手续费，请注意预留一部分的可用资金。'),
            this.$t('提示'),
            {
              confirmButtonText: this.$t('继续发送'),
              cancelButtonText: this.$t('取消发送'),
              type: 'warning',
            }
          )
            .then(() => {
              this.showConfirm = true;
            })
            .catch(() => {
              this.showConfirm = false;
            });
        }
        this.showConfirm = true;
      }
    },
    submit() {
      this.submitting = true;
      this.transfer({
        from: this.fromAccountName,
        to: this.toAccountName,
        memo: this.memo,
        amount: this.amount,
        password: this.password,
        tokenSymbol: this.tokenSymbol,
        precision: this.precision,
        walletId: this.walletData.publicKey,
        permission: this.permissions.filter(item => item.is_have)[0].name
      })
        .then(result => {
          Message.success(this.$t('转账成功'));
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : this.$t('转账失败')}`,
            message: err.message,
          });
          this.submitting = false;
          return Promise.reject(err);
        })
        .then(() => {
          this.getAccountInfo();
          this.close();
        });
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val);
    },
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      transfer: Actions.TRANSFER,
    }),
  },
  components: {
    ConfirmModal,
  },
};
</script>
