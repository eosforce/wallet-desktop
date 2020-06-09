<template>
  <confirm-modal :show="true" :submitting="submitting" @confirm="submit()" @close="close">
    <div>
      <div class="graphic">
        <div class="graphic-item">
          <img src="@/assets/vote/reward.png">
          <label>{{$t('待领分红')}}</label>
        </div>
        <div class="graphic-item">
          <img style="width: 50px;margin-left:50px;margin-right:50px;" src="@/assets/vote/transform.png">
          <label></label>
        </div>
        <div class="graphic-item">
          <img src="@/assets/vote/avaliable.png">
          <label>{{$t('可用余额')}}</label>
        </div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('交易名称')}}</div>
        <div class="row__content">{{$t('提取分红')}}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('超级节点名称')}}</div>
        <div class="row__content">{{bpname}}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('投票人用户')}}</div>
        <div class="row__content">{{voter}}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('可提取金额')}}</div>
        <div class="row__content">{{rewardAmount | formatNumber({p: 4, showSymbol: true})}}C</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('手续费')}}</div>
        <div class="row__content">1.0000 EOSC</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('输入密码')}}</div>
        <div class="row__content">
          <input class="input" v-model="password" type="password" :placeholder="$t('请输入投票人的钱包密码')" required />
        </div>
      </div>
    </div>
  </confirm-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import { Actions } from '@/constants/types.constants';

import { toUrl, calculate_fixed_reward_by_bpname, calcute_fixed_reward } from '@/utils/util';

export default {
  name: 'Claim',
  data() {
    return {
      password: '',
      submitting: false,
    };
  },
  computed: {
    voter() {
      return this.$route.params.accountName;
    },
    bpname() {
      return this.$route.params.bpname;
    },
    bpsTable () {
      return this.account.bpsTable;
    },
    MY_FIX_VOTES () {
      let data = JSON.parse( JSON.stringify( this.account.fix_votes_table ) );

      calcute_fixed_reward(data, this.head_block_num, this.bpsTable);

      return data;
    },
    head_block_num(){
      return this.app.currentNodeInfo.head_block_num;
    },
    rewardAmount() {
      const bp = this.account.bpsTable && this.account.bpsTable.find(bp => this.bpname === bp.name);
      let fixed_reward = calculate_fixed_reward_by_bpname(this.bpname, this.MY_FIX_VOTES.rows);
      let fix_reward = bp && bp.vote ? bp.vote.reward : 0;
      return fixed_reward.plus( fix_reward);
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
    submit() {
      this.submitting = true;
      this.claim({
        bpname: this.bpname,
        voter: this.voter,
        password: this.password,
        walletId: this.walletData.publicKey,
        permission: this.permissions.filter(item => item.is_have)[0].name
      })
        .then(result => {
          Message.success(this.$t('提取分红成功'));
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : this.$t('提取分红失败')}`,
            message: err.message,
          });
          this.submitting = false;
          return Promise.reject(err);
        })
        .then(result => {
          this.reload_fix_votes_table();
          this.getAccountInfo();
          this.close();
        });
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    calculate_fixed_reward_by_bpname,
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      claim: Actions.CLAIM,
      reload_fix_votes_table: 'reload_fix_votes_table'
    }),
  },
  components: {
    ConfirmModal,
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

