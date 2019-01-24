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
          <th>{{$t('年化利率')}}</th>
          <th>{{$t('奖池金额')}}</th>
          <th>{{$t('我的投票')}}</th>
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
        <tr v-if="!on_load_bps_table" v-for="bp in table" :key="bp.name" :class="{'is-vote': bp.hasVote}">
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
          <td>{{bp.adr | formatNumber({p: 0, sign: '%', percentage: 100})}}</td>
          <td>{{bp.rewards_pool | formatNumber({p: 4})}}</td>
          <td>
            <span v-show="!bp.hasVote">-</span>
            <span v-show="bp.hasVote">{{ (bp.vote ? bp.vote.vote || bp.vote.staked : 0) | formatNumber({p: 0})}}</span>
          </td>
          <td>
            <router-link class="button is-small is-outlined" :class="{'is-modify': bp.hasVote}" :to="{name: 'vote', params: { bpname: bp.name }}">
              {{bp.hasVote ? $t('修改投票') : $t('开始投票')}}
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
  name: 'BpList',
  computed: {
    table() {
      return this.account.bpsTable;
    },
    on_load_bps_table(){
      return this.account.on_load_bps_table;
    },
    ...mapState(['account', 'app']),
  },
  mounted () {

  },
  methods: {
    toUrl(url) {
      return toUrl(url);
    },
  },
};
</script>

<style scoped>
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
