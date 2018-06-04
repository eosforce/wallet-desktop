<template>
  <div class="box">
    <div class="img-box">
      <img src="@/assets/border.png" class="lt"/>
      <img src="@/assets/border.png" class="rt"/>
      <img src="@/assets/border.png" class="lb"/>
      <img src="@/assets/border.png" class="rb"/>
      <img src="@/assets/lace.png" class="lt2"/>
      <img src="@/assets/lace.png" class="rb2"/>
    </div>
    <div class="publickey">
      公钥：{{walletData.publicKey}}
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
        <li v-if="bpInfo">节点票龄:<span class="cl">{{bpInfo.average | msToDay}}</span></li>
        <li v-if="bpInfo">票龄更新时间:<span class="cl">{{bpInfo.voteage_update_time | timestamp}}</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import { Getters } from '@/constants/types.constants';
import { timestamp, number, rate, msToDay } from '@/utils/filter';

export default {
  name: 'AccountOverview',
  computed: {
    bpInfo() {
      return this.account.info.bpInfo;
    },
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['account', 'wallet']),
  },
  methods: {
    copyToClipboard(text) {
      this.$electron.clipboard.writeText(text);
    },
  },
  filters: {
    msToDay,
    rate,
    timestamp,
    number,
  },
};
</script>
