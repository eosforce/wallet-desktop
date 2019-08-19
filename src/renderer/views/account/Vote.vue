<template>
  <div class="modal is-active">
    <div class="cover-page">
      {{ table }}
      <div class="cover-page__content">
        <div class="cover-page__title">{{$t('超级节点投票')}}</div>

        {{ as_model_staked }}
        <form class="cover-page__form" @submit.prevent="confirmInfo">
          <div class="field_item">
            <div class="static-label form_label_item">
              <span>{{$t('超级节点名称')}} </span>
              <span class="static-text">{{bpname}}</span>
            </div>
          </div>
          <div class="field_item">
            <div class="static-label form_label_item">
              <span>{{$t('当前投票金额')}}</span>
              <span class="static-text">
                {{(stakedAmount.split(' ')[0]) | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}
              </span>
            </div>
          </div>
          <div class="field_item" v-if="fixed_model">
            <div class="static-label form_label_item">
              <span>{{$t('当前定期投票金额')}}</span>
              <span class="static-text">
                {{as_model_staked | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}
              </span>
            </div>
          </div>
          <div class="field_item" v-if="fixed_model == 0">
            <div class="static-label form_label_item">
              <span>{{$t('当前活期投票金额')}}</span>
              <span class="static-text">
                {{as_model_staked | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}
              </span>
            </div>
          </div>
          <div class="field_item" v-if="new Set(['0', '1']).has(selectType)">
            <div class="static-label form_label_item">
              <span>{{$t('可用投票金额')}}</span>
              <span class="static-text">{{staked | formatNumber({p: 4, showSymbol: true, symbol: wallet_show_symbol}) }}</span>
            </div>
          </div>
          <div class="field_item" v-if="selectType == 0 && IS_FEE_MODEL">
            <div class="static-label form_label_item">
              <span>{{$t('预留领取手续费')}}</span>
              <div class="fee_box">
                <input type="text" name="" v-model="fee_for_claim" class="small_input" >
                <span class="symbol_tag">{{ wallet_show_symbol }}</span>
              </div>
            </div>
          </div>
          <div class="field_item is-horizontal form_label_item">
            <label class="label" style="margin-bottom: 0px;">
              {{$t('投票类型')}}
            </label>
            <div class="control radio_items" style="margin-left:16px;color:#fff;">
              <label class="radio radio_item">
                <input type="radio" v-model="selectType" value="0" :disabled="selectMap['0'].disabled">
                <span>{{$t('追加投票')}}</span>
              </label>
              <label class="radio radio_item">
                <input type="radio" v-model="selectType" value="1" :disabled="selectMap['1'].disabled">
                <span>{{$t('赎回投票')}}</span>
              </label>
              <label class="radio radio_item">
                <input type="radio" v-model="selectType" value="2" :disabled="selectMap['2'].disabled">
                <span>{{$t('转投')}}</span>
              </label>
              <p class="help is-danger" v-show="amount && !isValidAmount">
                {{$t('金额必须为整数')}}
              </p>
            </div>
          </div>

          <div class="form_label_item static-label">
            <span class="white_ft">{{$t('投票期限')}}</span>
            <Select v-bind:select_list='fix_fixed_list' v-model="fixed_model"></Select>
          </div>

          <div class="form_label_item static-label" v-if="fixed_model == 1">
            <span class="white_ft">{{$t('投票期限')}}</span>
            <Select v-bind:select_list='fixed_time_list' v-model="fixed_time"></Select>
          </div>

          <!-- fixed_time_list -->

          <div class="field_item form_label_item" v-if="selectType == 2 && fixed_model != 1">
            <div class="label">
              {{$t('选择转投节点')}}
            </div>
            <div class="control">
              <select_pane v-model:value="bp_select_config.value" v-bind:list="bp_select_config.list"></select_pane>
            </div>
          </div>

          <div class="field_item form_label_item" v-if="selectType == 2 && fixed_model == 1">
            <div class="label">
              {{$t('选择节点已投定期')}}
            </div>
            <div class="control">
              <select_pane v-model:value="fixed_select_config.value" v-bind:list="fixed_select_config.list"></select_pane>
            </div>
          </div>

          <div class="field_item form_label_item" v-if="selectType == 2 && fixed_model == 1">
            <div class="label">
              {{$t('选择转投节点')}}
            </div>
            <div class="control">
              <select_pane v-model:value="fixed_to_select_config.value" v-bind:list="fixed_to_select_config.list"></select_pane>
            </div>
          </div>


          <!-- fixed_select_config -->
          <div class="field_item form_label_item" v-if="!(selectType == 2 && fixed_model == 1)">
            <label class="label">
              {{selectInfo.title}}
            </label>
            <div class="control" style="margin-top: 10px;">
              <input  v-model="amount" min="0" :max="selectInfo.max" class="input" type="number" step="1" :placeholder="$t('template.symbol', {symbol: wallet_show_symbol})"  required />
              <p class="help is-danger" v-show="amount && !isValidAmount">
                {{$t('金额必须为整数')}}
              </p>
              <p class="help tips" v-if="IS_FEE_MODEL">{{selectInfo.tip}}，{{$t('template.fee', {fee: symblo_change(fee, 'EOS', wallet_show_symbol) })}}</p>
              <p class="help is-danger" v-show="amount > selectInfo.max">
                {{selectInfo.maxTip}}
              </p>
            </div>
          </div>

          <div class="field_item" v-if="fixed_model == 0">
            <div class="static-label form_label_item" v-if="selectType == 0 || selectType == 1">
              <span>{{$t('修改后投票金额')}}</span>
              <span class="static-text">{{newStakedAmount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</span>
            </div>
            <div class="static-label form_label_item" v-if="[2].find(item => item == selectType) && amount && fixed_model == 0">
              <div>{{$t('修改后投票金额')}}</div>
              <div>
              <span class="">{{bpname}} : {{newStakedAmount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</span>
              </div>
              <div v-if="bp_select_config.value">
              <span class="">
              {{bp_select_config.value}} : {{ (bp_select_config.dict[bp_select_config.value] + parseInt(amount) ) | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}
              </span>
              </div>
            </div>
          </div>

          <div class="field_item form_label_item form_label_item_no_border">
              <div></div>
              <div>
                <a tabindex="-1" class="button cancel-button" @click="close">{{$t('取消')}}</a>
                <button type="submit" class="button is-link">{{$t('下一步')}}</button>
              </div>
            <!-- </div> -->
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
        <div class="row" v-if="selectType != 2">
          <div class="row__title">{{$t('交易名称')}}</div>
          <div class="row__content">{{$t('超级节点投票')}}</div>
        </div>
        <div class="row" v-if="selectType == 2">
          <div class="row__title">{{$t('交易名称')}}</div>
          <div class="row__content">{{$t('超级节点转投票')}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('超级节点')}}</div>
          <div class="row__content">{{bpname}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('投票人用户')}}</div>
          <div class="row__content">{{voter}}</div>
        </div>
        <div class="row" v-if="!(selectType == 2 && fixed_model == 1)">
          <div class="row__title">{{selectInfo.confirm}}</div>
          <div class="row__content">{{amount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row" v-if="(selectType == 2 && fixed_model == 1) && fixed_select_config_num">
          <div class="row__title">{{selectInfo.confirm}}</div>
          <div class="row__content">{{
          fixed_select_config_num | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{$t('修改后投票金额')}}</div>
          <div class="row__content">{{newStakedAmount | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row" v-if="(selectType == 2 && fixed_model == 0)">
          <div class="row__title">{{$t('转投节点')}}</div>
          <div class="row__content">{{bp_select_config.value | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row" v-if="selectType == 2 && fixed_model == 1">
          <div class="row__title">{{$t('转投节点')}}</div>
          <div class="row__content">{{ fixed_to_select_config.value }}</div>
        </div>
        <div class="row" v-if="selectType == 2 && fixed_model == 0">
          <div class="row__title">{{$t('转投后投票')}}</div>
          <div class="row__content">{{(bp_select_config.dict[bp_select_config.value] + parseInt(amount) ) | formatNumber({p: 0, showSymbol: true, symbol: wallet_show_symbol})}}</div>
        </div>
        <div class="row" v-if="IS_FEE_MODEL && selectType != 2">
          <div class="row__title">{{$t('手续费')}}</div>
          <div class="row__content">{{ symblo_change(fee, 'EOS', wallet_show_symbol) }} </div>
        </div>
        <div class="row" v-if="IS_FEE_MODEL && selectType == 2">
          <div class="row__title">{{$t('手续费')}}</div>
          <div class="row__content">{{ symblo_change('0.0100', 'EOS', wallet_show_symbol) }} </div>
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

import { 
         toNumber,
         symblo_change,
         toUrl, 
         calculate_fixed_votes_by_bpname, 
         calcute_fixed_reward,
         toBigNumber,
         calculate_fixed_reward_by_bpname
       } from '@/utils/util';

import Select from '@/views/components/select'
import select_pane from '@/components/select_pane.vue'

export default {
  name: 'vote',
  data() {
    return {
      amount: '',
      password: '',
      amount_for_claim_fee: 1,
      showConfirm: false,
      submitting: false,
      fee: 0.05,
      selectType: '0',
      fee_for_claim: 1,
      fix_fixed_list: [
        {value: '0', text: '活期'},
        {value: '1', text: '定期'}
      ],
      fixed_model: '0',
      fixed_time_list: [
        {value: 'fvote.d', text: '720天'},
        {value: 'fvote.c', text: '360天'},
        {value: 'fvote.b', text: '180天'},
        {value: 'fvote.a', text: '90天'},
      ],
      fixed_time: 'fvote.d',
      bp_select_config: {
        placeholder: '',
        text: '',
        value: '',
        list: [],
        dict: {}
      },
      fixed_select_config: {
        text: 'fixed_select_config',
        value: '',
        list: []
      },
      fixed_to_select_config: {
        text: 'fixed_select_config',
        value: '',
        list: []
      }
    };
  },
  computed: {
    fixed_select_config_num () {
      let row = this.fixed_select_config.list.find(row => row.value == this.fixed_select_config.value);
      return row ? row.num : 0;
    },
    can_used_ammount () {
      return parseFloat(this.account.info.available) - (parseFloat(this.amount_for_claim_fee) || 0);
    },
    table() {
      // fix select config
      let list = [];
      this.fixed_to_select_config.list.splice(0, this.fixed_to_select_config.list.length);
      this.bp_list_table.map(item => {
        this.bp_select_config.dict[item.name] = item.vote ? parseInt(item.vote.staked) : '0';

        this.fixed_to_select_config.list.push({
          value: item.name,
          text: item.name
        })

        if(item.name == this.bpname) return false;

        list.push({
          text: item.name + ' ' + this.$t('已投票') + ' ' + (item.vote ? item.vote.staked : '0'),
          value: item.name
        });
      });
      this.bp_select_config.list.splice(0, this.bp_select_config.list.length, ...list);

      // fixed select config
      let fixed_list = [];
      this.MY_FIX_VOTES.rows.forEach(row => {
        if(row.bpname != this.bpname) return;
        let vote_type = this.fixed_time_list.find(i => i.value == row.fvote_typ).text;
        fixed_list.push({
          text:  `${row.key} ${row.bpname} 已定投 ${vote_type} ${ symblo_change(row.vote) }`,
          num: toBigNumber(row.vote),
          value: row.key + ''
        });
      });

      this.fixed_select_config.list.splice(0, this.fixed_select_config.list.length, ...fixed_list);
      return '';
    },
    bp_list_table() {
      let data = JSON.parse( JSON.stringify( this.account.bpsTable ) );

      data.forEach(row => {
        row.fixed_vote   = calculate_fixed_votes_by_bpname(row.name, this.MY_FIX_VOTES.rows);
        let bp_fix_vote  = (row.vote ? row.vote.vote || row.vote.staked : 0);
        row.total_vote   = toBigNumber(bp_fix_vote).plus(row.fixed_vote);

        row.fixed_reward = calculate_fixed_reward_by_bpname(row.name);

        let bp_fix_reward = toBigNumber( row.vote ? row.vote.reward * 1 > 0 ? row.vote.reward : 0 : 0 );;
        row.total_reward = row.fixed_reward.plus(bp_fix_reward);
      });

      return data;
    },
    bpsTable () {
      return this.account.bpsTable;
    },
    MY_FIX_VOTES () {
      let data = JSON.parse( JSON.stringify( this.account.fix_votes_table ) );
      calcute_fixed_reward(data, this.head_block_num, this.bpsTable);
      console.log('MY_FIX_VOTES');
      console.log(data);
      return data;
    },

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
          max: toNumber(this.stakedAmount),
          maxTip: this.$t('超过当前投票金额！'),
          disabled: toNumber(this.stakedAmount) <= 0,
        },
        '2': {
          title: this.$t('转投金额（整数）'),
          confirm: this.$t('转投金额（整数）'),
          tip: this.$t('* 立即生效'),
          max:  toNumber(this.stakedAmount),
          maxTip: this.$t('超过可用投票金额！'),
          disabled: this.fixed_model == 1 ? false : toNumber(this.stakedAmount) <= 0,
        },
      };
    },
    newStakedAmount() {
      if (this.selectType === '0') {
        return toNumber(this.stakedAmount) + toNumber(this.amount);
      } else if (this.selectType === '1') {
        return toNumber(this.stakedAmount) - toNumber(this.amount);
      } else if (this.selectType === '2'){

        let fixed_model_val = this.fixed_select_config.list.find(row => row.value == this.fixed_select_config.value);
        fixed_model_val = fixed_model_val ? fixed_model_val.num : 0;
        return this.fixed_model == 1 ? this.as_model_staked - fixed_model_val : toNumber(this.stakedAmount) - toNumber(this.amount);

      } else {
        return undefined;
      }
    },
    as_model_new_staked () {
      if (this.selectType === '0') {

        let val = this.fixed_model == 1 ? toNumber(this.amount) :  toNumber(this.as_model_staked) + toNumber(this.amount);
        return val;

      } else if (this.selectType === '1') {

        let val = this.fixed_model == 1 ? toNumber(this.as_model_staked) : toNumber(this.as_model_staked) - toNumber(this.amount);
        return val;

      } else if (this.selectType === '2'){

        let val = this.fixed_model == 1 ? toNumber(this.as_model_staked) : toNumber(this.as_model_staked) - toNumber(this.amount);
        return val;

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
      const bp = this.bp_list_table && this.bp_list_table.find(bp => this.bpname === bp.name);
      if (bp) {
        if (bp.total_vote) {
          return bp.total_vote + ' EOS';
        } else {
          return '0 EOS';
        }
      } else {
        return null;
      }
    },
    as_model_staked() {
      const bp = this.bp_list_table && this.bp_list_table.find(bp => this.bpname === bp.name);
      if(this.fixed_model == 1){
        return bp.fixed_vote;
      }
      return toBigNumber( bp.vote ? bp.vote.staked : 0 );
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
    unfreeze_time () {
            // 518400
      if(!this.vote_and_voteram_freeze.data){
          return ;
      }
      let rows = this.vote_and_voteram_freeze.data.rows,
          row = rows.length ? rows[0] : null,
          unstake_height = row ? row.unstake_height : null,
          unfreeze_time = (this.nodeInfo.last_irreversible_block_num - unstake_height - 518400) * 2;
      return unfreeze_time;
    },
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
      if(this.selectType == 2 && this.fixed_model == 0){
        if(!this.bp_select_config.value) return ;
      }

      if(this.selectType == 2 && this.fixed_model == 1){
        if(!this.fixed_select_config.value || !this.fixed_to_select_config.value) return;
        this.showConfirm = true;
        return ;
      }

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
    async submit() {
      this.submitting = true;

      if(this.selectType == 2 && this.fixed_model == 1){
        let _form = {
          voter: this.voter, 
          fixed_key: this.fixed_select_config.value, 
          bpname: this.fixed_to_select_config.value, 
          pre_bp_name: this.bpname,
          walletId: this.walletData.publicKey,
          permission: this.permissions.filter(item => item.is_have)[0].name,
          password: this.password,
        }
        let result = await this.REVOTEFIX(_form).catch(error => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : this.$t('转投失败')}`,
            message: this.$t(err.message),
          });
          this.submitting = false;
          throw error;
        });

        Message.success(this.$t('转投成功'));
        this.reload_fix_votes_table();
        this.close();
        return ;
      }
      if(this.selectType == 2){
        let _form = {
          voter: this.voter,
          frombp: this.bpname,
          tobp: this.bp_select_config.value,
          restake: this.amount,
          walletId: this.walletData.publicKey,
          permission: this.permissions.filter(item => item.is_have)[0].name,
          password: this.password,
        }
        this.revote(_form)
        .then(result => {
          Message.success(this.$t('转投成功'));
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : this.$t('转投失败')}`,
            message: this.$t(err.message),
          });
          this.submitting = false;
          return Promise.reject(err);
        })
        .then(() => {
          this.getAccountInfo({ accountName: this.voter });
          this.close();
        });
        this.submitting = false;

      }else{

        this.vote({
          amount: this.newStakedAmount,
          amount: this.as_model_new_staked,
          bpname: this.bpname,
          password: this.password,
          voter: this.voter,
          fixed_model: this.fixed_model,
          fixed_time: this.fixed_time,
          walletId: this.walletData.publicKey,
          permission: this.permissions.filter(item => item.is_have)[0].name
        })
          .then(result => {
            Message.success(this.$t('投票成功'));
          })
          .catch(err => {
            Message.error({
              title: `${err.code ? `code: ${err.code}` : this.$t('投票失败')}`,
              message: this.$t(err.message),
            });
            this.submitting = false;
            return Promise.reject(err);
          })
          .then(() => {
            this.getAccountInfo({ accountName: this.voter });
            this.close();
          });

      }

    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val);
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    symblo_change,
    ...mapActions({
      reload_fix_votes_table: 'reload_fix_votes_table',
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      vote: Actions.VOTE,
      revote: Actions.REVOTE,
      REVOTEFIX: Actions.REVOTEFIX
    }),
  },
  components: {
    ConfirmModal,
    select_pane,
    Select
  },
};
</script>

<style>
.line_label{
  display: flex;
  align-items: center;
}
.small_line_input{
    border-radius: 2px;
    width: 128px;
    margin-left: 24px;
    line-height: 16px;
    height: 28px;
    background-color: rgba(171, 168, 168, 0.15);
    color: #fff;
}
.small_line_input:focus{
  color: #000;
}
.symbol_tag{
  font-size: 12px;
  margin-left: 7px;
  color: #c1c0c0;
}
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
.radio_item{
  display: flex;
  align-items: center;
  margin-right: 20px;
}
.radio_item input{
  margin-right: 10px;
  margin-left: 20px;
}
.radio_items{
  display: flex;
  align-items: center;
}
.form_label_item{
  padding: 20px 0px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 80px;
}
.form_label_item_no_border{
  border-bottom: 0px;
}
.fee_box{
  display: flex;
  align-items: center;
}
</style>
