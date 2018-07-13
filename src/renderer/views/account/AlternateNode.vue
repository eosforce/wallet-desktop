<template>
  <div class="box bplist-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th class="t-left">{{$t('排名')}}</th>
          <th class="t-left">{{$t('节点社区')}}</th>
          <th class="t-left">{{$t('节点名')}}</th>
          <th class="t-left">{{$t('节点网址')}}</th>
          <th class="t-center">{{$t('本届出块')}}</th>
          <th>{{$t('分红比例')}}</th>
          <th>{{$t('得票总数')}}</th>
          <th>{{$t('当选后年化利率')}}</th>
          <th>{{$t('奖池金额')}}</th>
          <th>{{$t('我的投票')}}</th>
          <th>{{$t('操作')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bp in table" :key="bp.name" :class="{'is-vote': bp.vote && bp.vote.isMyVote}">
          <td class="t-left">{{bp.order}}</td>
          <td class="t-left">{{($i18n.locale && app.bpNicks[$i18n.locale] && app.bpNicks[$i18n.locale][bp.name]) || bp.name}}</td>
          <td class="t-left">{{bp.name}}</td>
          <td class="t-left">
            <span v-show="!bp.url">-</span>
            <span v-show="bp.url">
              <a @click="$electron.shell.openExternal(bp.url)" target="_blank" class="bpurl">{{bp.url | hostname}}</a>
            </span>
          </td>
          <td class="t-center">-</td>
          <td>{{10000 - bp.commission_rate | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</td>
          <td>{{bp.total_staked | formatNumber({p: 0})}}</td>
          <td>{{bp.adr | formatNumber({p: 0, sign: '%', percentage: 100})}}</td>
          <td>{{bp.rewards_pool | formatNumber({p: 4})}}</td>
          <td>
            <span v-show="!bp.hasVote">-</span>
            <span v-show="bp.hasVote">{{ bp.vote && bp.vote.staked | formatNumber({p: 0})}}</span>
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

export default {
  name: 'AlternateNode',
  computed: {
    table() {
      return this.account.bpsTable.filter(bp => !bp.isSuperBp);
    },
    ...mapState(['account', 'app']),
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

/* tbody .is-vote {
  display: none;
} */

.bpurl{
  color:#276cda
}

.table td .button.is-small.is-modify{
    background: transparent;
    color: #408ee1;
    border: 1px solid #408ee1;
}
</style>
