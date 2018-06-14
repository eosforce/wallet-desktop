<template>
  <div class="box bplist-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>节点名</th>
          <th>分红比例</th>
          <th>总得票数</th>
          <th>年化利率</th>
          <th>奖池金额</th>
          <th>我的投票</th>
          <th>待领分红</th>
          <th>赎回金额</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bp in account.bpsTable" :key="bp.name" :class="{'is-vote': bp.hasVote}" v-show="bp.hasVote">
          <td>{{bp.order}}</td>
          <td>{{bp.name}}</td>
          <td>{{10000 - bp.commission_rate | rate}}</td>
          <td>{{bp.total_staked | number(0)}}</td>
          <td>
            <span v-show="bp.order >= 24">-</span>
            <span v-show="bp.order < 24 && bp.total_staked == 0">0%</span>
            <span v-show="bp.order < 24 && bp.total_staked !== 0">{{bp.total_staked | yearrate(1 - bp.commission_rate / 10000)}}</span>
          </td>
          <td>{{bp.rewards_pool | number}}</td>
          <td>
            <span v-show="!bp.hasVote">-</span>
            <span v-show="bp.hasVote">{{ bp.vote && bp.vote.staked | number(0)}}</span>
          </td>
          <td>
            <div v-show="!bp.hasVote">-</div>
            <el-tooltip v-show="bp.hasVote" class="item" effect="dark" content="我的投票*我的投票时间/(总得票数*总投票时间)*奖励池" placement="top-end">
              <div>
                <router-link
                  class="button is-small is-outlined"
                  :to="{ name: 'claim', params: { bpname: bp.name } }"
                >
                  {{(bp.vote && bp.vote.reward) | number}}
                </router-link>
              </div>
            </el-tooltip>
          </td>
          <td> 
            <div v-show="!(bp.hasVote && bp.vote.unstaking !== '0.0000 EOS')">-</div>
            <router-link v-show="bp.hasVote && bp.vote.unstaking !== '0.0000 EOS'" class="button is-small is-outlined" :to="{name: 'unfreeze', params: { bpname: bp.name }}">
              {{ bp.vote && bp.vote.unstaking | number(0) }}
            </router-link>
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

import { number, rate, voteage, yearrate } from '@/utils/filter';

export default {
  name: 'TransferRecord',
  data() {
    return {};
  },
  computed: {
    ...mapState(['account']),
  },
  filters: {
    number,
    rate,
    yearrate,
    voteage,
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
