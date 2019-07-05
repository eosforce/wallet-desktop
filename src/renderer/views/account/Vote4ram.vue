<template>
  <div class="modal is-active">
    <div class="cover-page">
      <div class="cover-page__content">
        <div class="cover-page__title">{{$t('内存租赁')}}</div>
        <form class="cover-page__form" @submit.prevent="confirmInfo">
          <div class="field">
            <div class="static-label">
              {{$t('超级节点名称')}}<span class="static-text">{{bpname}}</span>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              {{$t('当前投票金额')}}<span class="static-text">{{ramstakedAmount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</span>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              {{$t('可用投票金额')}}<span class="static-text">{{staked - fee_for_claim | formatNumber({p: 4, showSymbol: true, symbol: wallet_show_symbol})}}</span>
            </div>
          </div>
          <div class="field" v-if="selectType == 0 && IS_FEE_MODEL">
            <div class="static-label">
              {{$t('预留领取手续费')}}
              <input type="text" name="" v-model="fee_for_claim" class="small_input" >
              <span class="symbol_tag">{{ wallet_show_symbol }}</span>
            </div>
          </div>
          <div class="field is-horizontal">
            <label class="label">
              {{$t('投票类型')}}
            </label>
            <div class="control" style="margin-left:16px;color:#fff;">
              <label class="radio">
                <input type="radio" v-model="selectType" value="0" :disabled="selectMap['0'].disabled">
                {{$t('内存租赁')}}
              </label>
              <label class="radio">
                <input type="radio" v-model="selectType" value="1" :disabled="selectMap['1'].disabled">
                {{$t('取消内存')}}
              </label>
              <p class="help is-danger" v-show="amount && !isValidAmount">
                {{$t('金额必须为整数')}}
              </p>
            </div>
          </div>
          <div class="field">
            <label class="label">
              {{selectInfo.title}}
            </label>
            <div class="control">
              <input v-model="amount" min="0" :max="selectInfo.max" class="input" type="number" step="1" :placeholder="$t('template.symbol', {symbol: wallet_show_symbol})"  required />
              <p class="help is-danger" v-show="amount && !isValidAmount">
                {{$t('金额必须为整数')}}
              </p>
              <p class="help tips" v-if="IS_FEE_MODEL">{{selectInfo.tip}}，{{$t('template.fee', {fee: symblo_change(fee, 'EOS', wallet_show_symbol) })}}</p>
              <p class="help is-danger" v-show="amount > selectInfo.max">
                {{selectInfo.maxTip}}
              </p>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              {{$t('修改后投票金额')}}<span class="static-text">{{newStakedAmount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</span>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              {{$t('内存量')}}<span class="static-text">{{ ((newStakedAmount/10) * (1000/1024)).toFixed(4) }} K</span>
            </div>
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
      <a class="modal-close cover-page-close" @click="close"></a>
    </div>
    <confirm-modal :show="showConfirm" :submitting="submitting" @confirm="submit()" @close="toggle('showConfirm', false)">
      <div>
        <div class="graphic">
          <div class="graphic-item" :style="{order: this.selectType === '0' ? 1 : 3}">
            <img v-if="this.selectType === '0'" src="@/assets/vote/avaliable.png">
            <label v-if="this.selectType === '0'">{{$t('可用余额')}}</label>
            <img v-if="this.selectType === '1'" src="@/assets/vote/redeem.png">
            <label v-if="this.selectType === '1'">{{$t('赎回金额')}}</label>
          </div>
          <div class="graphic-item" style="order:2">
            <img style="width: 50px;margin-left:50px;margin-right:50px;" src="@/assets/vote/transform.png">
            <label></label>
          </div>
          <div class="graphic-item" :style="{order: this.selectType === '0' ? 3 : 1}">
            <img src="@/assets/vote/vote.png">
            <label>{{$t('投票金额')}}</label>
          </div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('交易名称')}}</div>
          <div class="row__content">{{$t('内存租赁')}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('超级节点')}}</div>
          <div class="row__content">{{bpname}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('投票人用户')}}</div>
          <div class="row__content">{{voter}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{selectInfo.confirm}}</div>
          <div class="row__content">{{amount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('修改后投票金额')}}</div>
          <div class="row__content">{{newStakedAmount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row" v-if="IS_FEE_MODEL">
          <div class="row__title">{{$t('手续费')}}</div>
          <div class="row__content">{{ symblo_change(fee, 'EOS', wallet_show_symbol) }} </div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('输入密码')}}</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" :placeholder="$t('请输入投票人的钱包密码')" required />
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
import { isValidAmount } from '@/utils/rules';
import { toNumber, symblo_change, toAsset } from '@/utils/util';

export default {
  name: 'vote4ram',
  data() {
    return {
      amount: '',
      password: '',

      showConfirm: false,
      submitting: false,
      fee: 0.05,
      selectType: '0',
      fee_for_claim: 1
    };
  },
  computed: {
    selectMap() {
      return {
        '0': {
          title: this.$t('追加金额（整数）'),
          confirm: this.$t('追加金额'),
          tip: this.$t('* 立即生效'),
          max: toNumber(this.staked) - this.fee - this.fee_for_claim,
          maxTip: this.$t('超过可用投票金额！'),
          disabled: false,
        },
        '1': {
          title: this.$t('赎回金额（整数）'),
          confirm: this.$t('赎回金额'),
          tip: this.$t('* 赎回锁定期三天，三天后需手动解锁'),
          max: toNumber(this.ramstakedAmount),
          maxTip: this.$t('超过当前投票金额！'),
          disabled: toNumber(this.ramstakedAmount) <= 0,
        }
      };
    },
    newStakedAmount() {
      if (this.selectType === '0') {
        return toNumber(this.ramstakedAmount) + toNumber(this.amount);
      } else if (this.selectType === '1') {
        return toNumber(this.ramstakedAmount) - toNumber(this.amount);
      } else {
        return undefined;
      }
    },
    selectInfo() {
      return this.selectMap[this.selectType];
    },
    voter() {
      return this.$route.params.accountName;
    },
    bpname() {
      return this.$route.params.bpname;
    },
    stakedAmount() {
      const bp = this.account.bpsTable && this.account.bpsTable.find(bp => this.bpname === bp.name);
      if (bp) {
        if (bp.vote) {
          return bp.vote.staked;
        } else {
          return '0 ' + this.wallet_symbol;
        }
      } else {
        return null;
      }
    },
    ramstakedAmount() {
      const bp = this.account.bpsTable && this.account.bpsTable.find(bp => this.bpname === bp.name);
      if (bp) {
        if (bp.ramvote) {
          return bp.ramvote.staked || bp.ramvote.vote;
        } else {
          return '0 ' + this.wallet_symbol;
        }
      } else {
        return null;
      }
    },
    isValidAmount() {
      return this.amount && isValidAmount(this.amount);
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
    wallet_symbol () {
      return this.wallet.wallet_symbol;
    },
    wallet_show_symbol () {
      return this.wallet.wallet_show_symbol;
    },
    IS_FEE_MODEL () {
      return this.wallet.IS_FEE_MODEL;
    },
    HAS_FREEZED () {
      return this.wallet.HAS_FREEZED;
    },
    // unfreeze_time () {
    //         // 518400
    //   if(!this.vote_and_voteram_freeze.data){
    //       return ;
    //   }
    //   let rows = this.vote_and_voteram_freeze.data.rows,
    //       row = rows.length ? rows[0] : null,
    //       unstake_height = row ? row.unstake_height : null,
    //       unfreeze_time = (this.nodeInfo.last_irreversible_block_num - unstake_height - 518400) * 2;
    //   return unfreeze_time;
    // },
    unstaking () {
      if(!this.vote_and_voteram_freeze.data){
          return ;
      }
      let rows = this.vote_and_voteram_freeze.data.rows,
          row = rows.length ? rows[0] : null,
          unstaking = row ? row.unstaking : 0;
      return toNumber(unstaking);
    },
    staked () {
      if(this.VOTE_BACK_STATE){
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
    VOTE_BACK_STATE () {
      return this.wallet.VOTE_BACK_STATE;
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  mounted () {
    this.update_lease_fee();
  },
  methods: {
    update_lease_fee () {
      if(!this.IS_FEE_MODEL){
        this.fee_for_claim = 0;
        this.fee = 0;
      }
    },
    confirmInfo() {
      if (this.isValidAmount && this.newStakedAmount !== undefined) {
        if (this.selectType === '0') {
          const isOver = toNumber(this.staked) - toNumber(this.amount) - 0.1 - this.fee;
          if (isOver < 0.00001) {
            return this.$confirm(
              this.$t('您的可用余额将降低到0.1以下，可能不够缴纳后续交易的手续费，请注意预留一部分的可用资金。'),
              this.$t('提示'),
              {
                confirmButtonText: this.$t('继续发送'),
                cancelButtonText: this.$t('取消发送'),
                type: 'warning',
              }
            ).then(() => {
              this.showConfirm = true;
            }).catch(() => {
              this.showConfirm = false;
            });
          }
        }
        this.showConfirm = true;
      }
    },
    submit() {
      this.submitting = true;

      this.vote4ram({
        amount: toAsset(this.newStakedAmount, this.wallet_symbol),
        bpname: this.bpname,
        password: this.password,
        voter: this.voter,
        walletId: this.walletData.publicKey,
        permission: this.permissions.filter(item => item.is_have)[0].name
      })
      .then(result => {
        Message.success(this.$t('投票成功'));
        this.getAccountInfo({ accountName: this.voter });
        this.close();
      })
      .catch(err => {
        Message.error({
          title: this.$t('投票失败'),
          message: err,
        });
      })
      .then(res => {
        this.submitting = false;
      });

    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val);
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    symblo_change,
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      vote4ram: Actions.VOTE4RAM,
    }),
  },
  components: {
    ConfirmModal,
  },
};
</script>

<style>
.small_input{
    border-radius: 4px;
    outline: none;
    border: 0px;
    padding: 6px 11px;
    width: 98px;
    background: rgba(0, 0, 0, 0.12);
    color: #a79f9f;
    margin-left: 10px;
    font-size: 14px;
}
.symbol_tag{
  font-size: 12px;
}
.radio:hover {
  color: #fff;
}
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
