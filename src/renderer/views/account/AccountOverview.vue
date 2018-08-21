<template>
  <div>
    <!-- <div class="load_accounts_detail" v-if="on_load_info">
      <div class="load_area_out">
        <div class="load_area">
          <div class="load_circle account_detail_loader"></div><div>正在努力刷新</div>
        </div>
      </div>
    </div> -->
    <!-- <div class="load_area">
          <div class="load_circle account_detail_loader"></div>
    </div> -->
    <div class="box">

      <div class="publickey account_detail_item">
        <ul class="account_info_box">
          <li>
              <span>{{$t('用户名')}}：</span>
              <span>{{$route.params.accountName}}</span>
                  <span v-if="!on_load_info" v-for="item in permissions" class="permission_tag" v-bind:class="{'permission_tag_not_have': !item.is_have}">{{ item.name }}</span>
              </span>
              <div class="load_circle account_detail_loader" v-if="on_load_info"></div>
          </li>
          <li>
             <router-link v-if="!on_load_info" style="width: 110px;background: #408ee1;border-radius: 17.5px;color: #fff;border: none;" class="button is-small is-link" :to="{name: 'accountCreateAccount'}">
            {{$t('创建用户')}}
              </router-link>

              <router-link v-if="has_owner && !on_load_info" style="width: 110px;background: #408ee1;border-radius: 17.5px;color: #fff;border: none;" class="button is-small is-link" :to="{name: 'accountTransfer'}">
                {{$t('账户转让')}}
              </router-link>
          </li>
        </ul>

        <span class="is-grouped box_loader_ct">
          <span class="refresh fr el-icon-refresh" :class="{spin: spin}" @click="refreshOverview()"></span>
        </span>

      </div>

      <div class="box_item">
        <ul class="account_info_box">
          <li class="account_detail_item w_200">
            <span>{{$t('资产总额')}}:</span>
            <span class="cl" v-if="!on_load_info">{{account.info.assetTotal | formatNumber({p: 4})}}</span>
            <div class="load_circle account_detail_loader" v-if="on_load_info"></div>
          </li>
          <li class="account_detail_item w_200">
            <span>{{$t('可用余额')}}:</span>
            <span class="cl" v-if="!on_load_info">{{account.info.available | formatNumber({p: 4})}}</span>
            <div class="load_circle account_detail_loader" v-if="on_load_info"></div>
            <router-link class="button is-small is-link box_transfer_link" :to="{name: 'transfer'}" v-if="!on_load_info">{{$t('转账')}}</router-link>
          </li>
        </ul>
      </div>

      <div class="box_item">
        <ul class="account_info_box">
          <li class="account_detail_item w_200">
            <span>{{$t('投票总额')}}:</span>
            <span class="cl" v-if="!on_load_info">{{account.info.stakedTotal | formatNumber({p: 0})}}</span>
            <div class="load_circle account_detail_loader" v-if="on_load_info"></div>
          </li>
          <li class="account_detail_item w_200">
            <span>{{$t('赎回总额')}}:</span>
            <span class="cl" v-if="!on_load_info">{{account.info.unstakingTotal | formatNumber({p: 0})}}</span>
            <div class="load_circle account_detail_loader" v-if="on_load_info"></div>
          </li>
          <li class="account_detail_item w_200">
            <span>{{$t('待领分红总额')}}:</span>
            <span class="cl" v-if="!on_load_info">{{account.info.rewardTotal | formatNumber({p: 4})}}</span>
            <div class="load_circle account_detail_loader" v-if="on_load_info"></div>
          </li>
          <li v-if="bpInfo">
            <span>{{$t('佣金费率')}}:</span>
            <span class="cl">{{bpInfo.commission_rate | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</span>
          </li>
        </ul>
      </div>
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
    on_load_info() {
      return this.account.on_load_info;
    },
    baseInfo() {
      return this.account.info.baseInfo || {permissions: []};
    },
    permissions () {
      let res = [];
      if(!this.baseInfo.permissions){
        return [];
      }
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
    last_irreversible_block_num() {
      return this.app.currentNodeInfo.last_irreversible_block_num;
    },
    ...mapState(['account', 'wallet', 'app']),
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
.box_item{

}
.account_info_box{
  height: 40px;
  font-size: 14px;
  display: flex;
  width: 100%;
  align-items: center;
}
.account_info_box li{
  margin-right: 20px;
}
.account_detail_item{
  display: flex;
  align-items: center;
}
.permission_tag{
  border: 1px solid #578DDB;
  color: #578DDB;
  line-height: 1;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 0px 4px 1px 4px;
  margin-right: -6px;
  transform: scale(0.8);
  display: inline-block;
}
.permission_tag_not_have{
  border: 1px solid #909399;
  color: #909399;
}
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
.box_loader_ct{
  line-height: 27px;
  text-align: left;
  height: 27px;
  font-size: 14px;
  position: absolute;
  right: 28px;
  top: 24px;
}
.account_detail_loader{
  width: 10px;
  height: 10px;
  margin-left: 10px;
  margin-top: 3px;
}
.w_200{
  width: 200px;
}
.box_transfer_link{
  margin-left: 20px;
}
</style>
