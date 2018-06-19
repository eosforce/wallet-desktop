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
      <span style="width:25%;  display: inline-block;">资产总额:<span class="cl">{{account.info.assetTotal | number | NumFormat}}</span></span>
      <span style="width:25%;  display: inline-block;">可用余额:<span class="cl">{{account.info.available | number | NumFormat}}</span></span>
      <router-link class="button is-small is-outlined" :to="{name: 'transfer'}">转账</router-link>
      <router-link style="margin-left:15px" class="button is-small is-outlined" :to="{name: 'accountCreateAccount'}">创建用户</router-link>
    </div>
    <div class="desc-box clearfix">
      <ul>
        <li><span>投票总额:</span><span class="cl">{{account.info.stakedTotal | number}}</span></li>
        <li><span>赎回总额:</span><span class="cl">{{account.info.unstakingTotal | number}}</span></li>
        <li><span>待领分红总额:</span><span class="cl">{{account.info.rewardTotal | number}}</span></li>
        <li v-if="bpInfo"><span>佣金费率:</span><span class="cl">{{bpInfo.commission_rate | rate}}</span></li>
        <!-- <li v-if="bpInfo">得票总额:<span class="cl">{{bpInfo.total_staked | number}}</span></li>
        <li v-if="bpInfo">节点票龄:<span class="cl">{{bpInfo.average | voteage}}</span></li>
        <li v-if="bpInfo">票龄更新时间:<span class="cl">{{bpInfo.voteage_update_time | timestamp}}</span></li> -->
      </ul>
    </div>
    <div class="dec">
      <p><span style="color:#f00">*特别提醒*：</span></p>
      <p>1. 本钱包只提供创建公私钥服务，您需要进一步创建用户名才能做链上操作。</p>
      <p>2. 请向已经拥有链上用户名的第三方提出创建申请，向其提供您的公钥(EOS...) 和期望的用户名，切勿提供您的私钥（5...）。</p>
      <p>3. 创建用户名交易需要花费第三方0.1个EOS，创建交易成功后，用户名会自动显示在左侧。</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';
import { timestamp, number, rate, voteage, NumFormat } from '@/utils/filter';

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
    NumFormat,
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

.dec {
  margin-top: 20px;
  font-size: 14px;
}
</style>
