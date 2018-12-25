<template>
  <div class="box bplist-box">

    <!-- <div class="load_area" v-if="on_load_bps_table">
        <div class="load_circle account_detail_loader"></div><div>loading</div>
    </div> -->



    <table class="table data-table">
      <thead>
        <tr>
          <th class="t-left">{{$t('排名')}}</th>
          <th class="t-left">{{$t('节点社区')}}</th>
          <th class="t-left">{{$t('节点名')}}</th>
          <th class="t-center">{{$t('本届出块')}}</th>
          <th>{{$t('分红比例')}}</th>
          <th>{{$t('得票总数')}}</th>
          <!-- <th>{{$t('年化利率')}}</th> -->
          <!-- <th>{{$t('奖池金额')}}</th> -->
          <th>{{$t('我的投票')}}</th>
          <th>{{$t('赎回金额')}}</th>
          <th>{{$t('操作')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="on_load_bps_table">
          <td colspan="10">
            <div class="load_area table_inner_load">
                <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力刷新')}}</div>
            </div>
          </td>
        </tr>
        <tr v-if="!on_load_bps_table" v-for="bp in table" :key="bp.name" :class="{'is-vote': bp.hasRamvote}">
          <td class="t-left">
            <el-tooltip :content="$t('正在出块')" placement="left" v-show="app.currentNodeInfo.head_block_producer === bp.name">
              <img src="@/assets/loader/producing.svg" width="20">
            </el-tooltip>
            <div v-if="app.currentNodeInfo.head_block_producer !== bp.name">{{bp.order}}</div>
          </td>
          <td class="t-left">
            <a @click="$electron.shell.openExternal(toUrl(bp.url))" v-if="bp.amount > 0" style="color: #3273dc">
              {{($i18n.locale && app.bpNicks[$i18n.locale] && app.bpNicks[$i18n.locale][bp.name]) || bp.name}}
            </a>
            <a @click="$electron.shell.openExternal(toUrl(bp.url))" v-if="!bp.amount && bp.adr" style="color: #92b2f1">
              {{($i18n.locale && app.bpNicks[$i18n.locale] && app.bpNicks[$i18n.locale][bp.name]) || bp.name}}
            </a>
            <a @click="$electron.shell.openExternal(toUrl(bp.url))" v-if="!bp.amount && !bp.adr" style="color: #bec2c9">
              {{($i18n.locale && app.bpNicks[$i18n.locale] && app.bpNicks[$i18n.locale][bp.name]) || bp.name}}
            </a>
          </td>
          <td class="t-left">{{bp.name}}</td>
          <td class="t-center">{{bp.amount || '_'}}</td>
          <td>{{(10000 - bp.commission_rate) | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</td>
          <td>{{bp.total_staked | formatNumber({p: 0})}}</td>
          <!-- <td>{{bp.adr | formatNumber({p: 0, sign: '%', percentage: 100})}}</td> -->
          <!-- <td>{{bp.rewards_pool | formatNumber({p: 4})}}</td> -->
          <td>
            <span v-show="!bp.hasRamvote">-</span>
            <span v-show="bp.hasRamvote">{{ bp.ramvote && bp.ramvote.staked | formatNumber({p: 0})}}</span>
          </td>
          <td>
            <template v-if="bp.ramvote">
              <div v-show="bp.ramvote.unstaking === '0.0000 EOS'">-</div>
              <router-link v-show="bp.ramvote.unstaking !== '0.0000 EOS'" class="button is-small is-outlined" :class="{'grey-button': isLock(bp.ramvote.unstake_height)}" :to="{name: 'Unfreeze4ram', params: { bpname: bp.name }}">
                {{ bp.ramvote && bp.ramvote.unstaking | formatNumber({p: 0}) }}
              </router-link>
            </template>
          </td>
          <td>
            <router-link class="button is-small is-outlined" :class="{'is-modify': bp.hasRamvote}" :to="{name: 'vote4ram', params: { bpname: bp.name }}">
              {{bp.hasRamvote ? $t('修改投票') : $t('租赁内存')}}
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { toUrl } from '@/utils/util';

export default {
  name: 'Vote4ram',
  computed: {
    table() {
      return this.account.bpsTable;
    },
    on_load_bps_table(){
      return this.account.on_load_bps_table;
    },
    head_block_num(){
      return this.app.currentNodeInfo.head_block_num;
    },
    ...mapState(['account', 'app']),
  },
  mounted () {

  },
  methods: {
    toUrl(url) {
      return toUrl(url);
    },
    isLock(unstakeHeight) {
      if (unstakeHeight === undefined) return false;
      return unstakeHeight + 86400 - this.head_block_num > 0;
    },
  },
};
</script>

<style scoped>
.table td .button.grey-button {
  background: #ddd;
  color: #363636;
}
.button {
  padding-left: calc(0.625em - 1px);
  padding-right: calc(0.625em - 1px);
}
.is-button span {
  background: #408ee1;
  border-radius: 5px;
  color: #fff;
  border: none;
  padding-left: calc(0.625em - 1px);
  padding-right: calc(0.625em - 1px);
  padding-bottom: calc(0.375em - 1px);
  padding-top: calc(0.375em - 1px);
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
}

.bpurl {
  color: #276cda;
}

.table td .button.is-small.is-modify {
  background: transparent;
  color: #408ee1;
  border: 1px solid #408ee1;
}
</style>
