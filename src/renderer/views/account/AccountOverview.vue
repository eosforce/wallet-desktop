<template>
  <div class="box">
    <div class="publickey">
      公钥：{{walletData.publicKey}}
      <span class="is-grouped" style="margin-top:16px;line-height:27px;text-align:left;height:27px;font-size:14px;margin-left: 40px;">
        <a style="margin-left:15px" class="button is-small is-outlined" @click="exportWallet()">导出钱包</a>
      </span>
    </div>
    <div class="overview-refresh">
      <span class="refresh fr el-icon-refresh" @click="refreshOverview()"></span>
    </div>

    <div class="is-grouped" style="margin-top:16px;line-height:27px;text-align:left;height:27px;font-size:14px">
      <span style="width:25%;  display: inline-block;">资产总额:<span class="cl">{{account.info.assetTotal | number}}</span></span>
      <span style="width:25%;  display: inline-block;">可用余额:<span class="cl">{{account.info.available | number}}</span></span>
      <router-link class="button is-small is-outlined" :to="{name: 'transfer'}">转账</router-link>
      <router-link style="margin-left:15px" class="button is-small is-outlined" :to="{name: 'accountNew'}">创建用户</router-link>
    </div>
    <div class="desc-box clearfix">
      <ul>
        <li>投票总额:<span class="cl">{{account.info.stakedTotal | number}}</span></li>
        <li>赎回总额:<span class="cl">{{account.info.unstakingTotal | number}}</span></li>
        <li>待领分红总额:<span class="cl">{{account.info.rewardTotal | number}}</span></li>
        <li v-if="bpInfo">佣金费率:<span class="cl">{{bpInfo.commission_rate | rate}}</span></li>
        <!-- <li v-if="bpInfo">得票总额:<span class="cl">{{bpInfo.total_staked | number}}</span></li>
        <li v-if="bpInfo">节点票龄:<span class="cl">{{bpInfo.average | voteage}}</span></li>
        <li v-if="bpInfo">票龄更新时间:<span class="cl">{{bpInfo.voteage_update_time | timestamp}}</span></li> -->
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
    ...mapState(['account', 'wallet']),
  },
  methods: {
    copyToClipboard(text) {
      this.$electron.clipboard.writeText(text);
    },
    refreshOverview() {
      this.refreshAccount();
    },
    // 导出钱包存储文件
    exportWallet() {
      this.fetchWallet({ id: this.$route.params.walletId, mutation: false }).then(data => {
        const filename = `UTC--${new Date().toISOString()}--${data.publicKey}`;
        const file = new File([JSON.stringify(data)], filename, { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
      });
    },
    ...mapActions({
      refreshAccount: Actions.GET_ACCOUNT_OVERVIEW,
      fetchWallet: Actions.FETCH_WALLET,
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
  font-size: 20px;
  cursor: pointer;
}
.refresh img {
  width: 15px;
  margin: 12px 2px;
}
</style>
