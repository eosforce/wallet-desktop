<template>
  <div class="box">
    <div class="publickey">
      公钥：{{walletData.publicKey}}
    </div>
    <div class="overview-refresh">
      <span class="refresh fr" @click="refreshOverview()"><img src="@/assets/refresh.png"></span>
    </div>

    <div class="is-grouped" style="margin-top:16px;line-height:27px;text-align:left;height:27px;font-size:14px">
      <span style="width:25%;  display: inline-block;">总资产:<span class="cl">{{account.info.assetTotal | number}}</span></span>
      <span style="width:25%;  display: inline-block;">可用余额:<span class="cl">{{account.info.available | number}}</span></span>
      <router-link class="button is-small is-outlined" :to="{name: 'transfer'}">转账</router-link>
      <router-link style="margin-left:15px" class="button is-small is-outlined" :to="{name: 'accountNew'}">创建用户</router-link>
    </div>
    <div class="desc-box clearfix">
      <ul>
        <li>总投票金额:<span class="cl">{{account.info.stakedTotal | number}}</span></li>
        <li>总待领取分红:<span class="cl">{{account.info.rewardTotal | number}}</span></li>
        <li>总赎回金额:<span class="cl">{{account.info.unstakingTotal | number}}</span></li>
        <li v-if="bpInfo">手续费率:<span class="cl">{{bpInfo.commission_rate | rate}}</span></li>
        <li v-if="bpInfo">总得票金额:<span class="cl">{{bpInfo.total_staked | number}}</span></li>
        <li v-if="bpInfo">节点票龄:<span class="cl">{{bpInfo.average | voteage}}</span></li>
        <li v-if="bpInfo">票龄更新时间:<span class="cl">{{bpInfo.voteage_update_time | timestamp}}</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';
import { timestamp, number, rate, voteage } from '@/utils/filter';

export default {
  name: 'AccountOverview',
  computed: {
    bpInfo() {
      return this.account.info.bpInfo;
    },
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState([ 'account', 'wallet']),
  },
  methods: {
    copyToClipboard(text) {
      dddsdf();
      this.$electron.clipboard.writeText(text);
    },
    refreshOverview() {
      this.refreshAccount();
    },
    ...mapActions({
      refreshAccount: Actions.GET_ACCOUNT_OVERVIEW,
    }),
  },
  filters: {
    voteage,
    rate,
    timestamp,
    number,
  },
};
</script>

<style scoped>
.refresh {
  height: 40px;
  margin-top: -28px;
}
.refresh img {
  width: 15px;
  margin: 12px 2px;
}
</style>
