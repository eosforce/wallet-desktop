<template>
  <div class="box">
    <div class="publickey">
      <span class="pk" style="min-width: 25%;width:auto;">{{$t('用户名')}}：<span style="color: #000;margin-left: 10px;font-weight: 600;">{{$route.params.accountName}}</span></span>
      <span>
        <router-link style="width: 110px;background: #408ee1;border-radius: 17.5px;color: #fff;border: none;" class="button is-small is-link" :to="{name: 'accountCreateAccount'}">
          {{$t('创建用户')}}
        </router-link>
        <router-link style="width: 110px;background: #408ee1;border-radius: 17.5px;color: #fff;border: none;" class="button is-small is-link" :to="{name: 'accountCreateAccount'}">
          {{$t('用户名转让')}}
        </router-link>
      </span>
      <span class="is-grouped " style="line-height:27px;text-align:left;height:27px;font-size:14px;width:15%;
      ">
        <span class="refresh fr el-icon-refresh" :class="{spin: spin}" @click="refreshOverview()"></span>
      </span>
    </div>
    <div class="is-grouped desc-box clearfix" style="margin-top:8px;line-height:27px;text-align:left;height:27px;font-size:14px">
      <ul>
        <li>{{$t('资产总额')}}:<span class="cl">{{account.info.assetTotal | formatNumber({p: 4})}}</span></li>
        <li>{{$t('可用余额')}}:<span class="cl">{{account.info.available | formatNumber({p: 4})}}</span></li>
        <li class="lw"><router-link class="button is-small is-link" :to="{name: 'transfer'}">{{$t('转账')}}</router-link></li>
      </ul>
    </div>
    <div class="desc-box clearfix">
      <ul>
        <li><span>{{$t('投票总额')}}:</span><span class="cl">{{account.info.stakedTotal | formatNumber({p: 0})}}</span></li>
        <li><span>{{$t('赎回总额')}}:</span><span class="cl">{{account.info.unstakingTotal | formatNumber({p: 0})}}</span></li>
        <li><span>{{$t('待领分红总额')}}:</span><span class="cl">{{account.info.rewardTotal | formatNumber({p: 4})}}</span></li>
        <li v-if="bpInfo"><span>{{$t('佣金费率')}}:</span><span class="cl">{{bpInfo.commission_rate | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</span></li>
      </ul>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';

export default {
  name: 'AccountOverview',
  data() {
    return {
      spin: false,
    };
  },
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
    async refreshOverview() {
      if (this.spin) return;
      this.spin = true;
      try {
        await this.refreshAccount();
        await this.refreshWallet();
        this.spin = false;
      } catch (err) {
        this.spin = false;
      }
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
  height: auto;
  font-size: 20px;
  cursor: pointer;
}

.refresh.spin {
  animation: spin 1s linear infinite;
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
