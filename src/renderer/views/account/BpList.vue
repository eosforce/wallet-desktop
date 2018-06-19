<template>
  <div class="box bplist-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>节点名</th>
          <th>节点网址</th>
          <th>本届出块</th>
          <th>分红比例</th>
          <th>得票总数</th>
          <th>年化利率</th>
          <th>奖池金额</th>
          <th>我的投票</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bp in table" :key="bp.name" :class="{'is-vote': bp.hasVote}">
          <td>{{bp.order}}</td>
          <td>{{bp.name}}</td>
          <td><a :href="bp.url" target="_blank">{{bp.url.replace(/^(http|https):\/\/(www\.)?/,'')}}</a></td>
          <td>{{bp.amount}}</td>
          <td>{{10000 - bp.commission_rate | rate}}</td>
          <td>{{bp.total_staked | number(0) | intPartFormat(0)}}</td>
          <td>
            <span v-show="bp.order >= 24">-</span>
            <span v-show="bp.order < 24 && bp.total_staked == 0">0%</span>
            <span v-show="bp.order < 24 && bp.total_staked !== 0">{{bp.total_staked | yearrate(1 - bp.commission_rate / 10000)}}</span>
          </td>
          <td>{{bp.rewards_pool | number | NumFormat}}</td>
          <td>
            <span v-show="!bp.hasVote">-</span>
            <span v-show="bp.hasVote">{{ bp.vote && bp.vote.staked | number(0) | intPartFormat(0)}}</span>
          </td>
          <td>
            <router-link class="button is-small is-outlined" :to="{name: 'vote', params: { bpname: bp.name }}">投票</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { number, rate, voteage, yearrate, intPartFormat, NumFormat } from '@/utils/filter';

export default {
  name: 'BpList',
  computed: {
    table() {
      return this.account.bpsTable.filter(bp => bp.isSuperBp);
    },
    ...mapState(['account']),
  },
  filters: {
    number,
    rate,
    yearrate,
    voteage,
    intPartFormat,
    NumFormat,
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
/* .bplist-box tbody .is-vote{
  display: none;
} */
</style>
