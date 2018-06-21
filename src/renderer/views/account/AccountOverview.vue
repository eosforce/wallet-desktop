<template>
  <div class="box">
    <div class="publickey">
      <span class="pk">公钥：{{walletData.publicKey}}</span>
      <span class="is-grouped " style="line-height:27px;text-align:left;height:27px;font-size:14px;width:15%;
      ">
        <span class="refresh fr el-icon-refresh" @click="refreshOverview()"></span>
      </span>
    </div>
    <div class="is-grouped desc-box clearfix" style="margin-top:16px;line-height:27px;text-align:left;height:27px;font-size:14px">
      <ul>
        <li>资产总额:<span class="cl">{{account.info.assetTotal | formatNumber({p: 4})}}</span></li>
        <li>可用余额:<span class="cl">{{account.info.available | formatNumber({p: 4})}}</span></li>
        <li class="lw"><router-link class="button is-small is-link" :to="{name: 'transfer'}">转账</router-link></li>
        <li><router-link class="button is-small is-link" :to="{name: 'accountCreateAccount'}">创建用户</router-link></li>
      </ul>
    </div>
    <div class="desc-box clearfix">
      <ul>
        <li><span>投票总额:</span><span class="cl">{{account.info.stakedTotal | formatNumber({p: 0})}}</span></li>
        <li><span>赎回总额:</span><span class="cl">{{account.info.unstakingTotal | formatNumber({p: 0})}}</span></li>
        <li><span>待领分红总额:</span><span class="cl">{{account.info.rewardTotal | formatNumber({p: 4})}}</span></li>
        <li v-if="bpInfo"><span>佣金费率:</span><span class="cl">{{bpInfo.commission_rate | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';

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
      this.refreshWallet();
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
      refreshWallet: Actions.REFRESH_WALLET,
      fetchWallet: Actions.FETCH_WALLET,
    }),
  },
};
</script>

<style scoped>
.refresh {
  height: 40px;
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

.pk {
  display: inline-block;
  width: 65%;
}
.lw {
  width: 15% !important;
}
</style>
