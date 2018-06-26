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
          <td>
            <span v-show="!bp.url">-</span>
            <span v-show="bp.url"><a :href="bp.url" target="_blank">{{bp.url | hostname}}</a></span>
          </td>
          <td>{{bp.amount}}</td>
          <td>{{(10000 - bp.commission_rate) | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</td>
          <td>{{bp.total_staked | formatNumber({p: 0})}}</td>
          <td>{{bp.adr | formatNumber({p: 0, sign: '%', percentage: 100})}}</td>
          <td>{{bp.rewards_pool | formatNumber({p: 4})}}</td>
          <td>
            <span v-show="!bp.hasVote">-</span>
            <span v-show="bp.hasVote">{{ bp.vote && bp.vote.staked | formatNumber({p: 0})}}</span>
          </td>
          <td>
            <router-link class="button is-small is-outlined" :to="{name: 'vote', params: { bpname: bp.name }}">
              {{bp.hasVote ? '修改投票' : '开始投票'}}
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
  name: 'BpList',
  computed: {
    table() {
      return this.account.bpsTable.filter(bp => bp.isSuperBp);
    },
    ...mapState(['account']),
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
</style>
