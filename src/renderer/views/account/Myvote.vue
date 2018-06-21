<template>
  <div class="box bplist-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>节点名</th>
          <th>分红比例</th>
          <th>得票总数</th>
          <th>年化利率</th>
          <th>奖池金额</th>
          <th>我的投票</th>
          <th>待领分红</th>
          <th>赎回金额</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bp in table" :key="bp.name" :class="{'is-vote': bp.hasVote}">
          <td>{{bp.order}}</td>
          <td>{{bp.name}}</td>
          <td>{{10000 - bp.commission_rate | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</td>
          <td>{{bp.total_staked | formatNumber({p: 0})}}</td>
          <td>
            <span v-show="bp.order >= 24">-</span>
            <span v-show="bp.order < 24">{{bp.adr | formatNumber({p: 0, sign: '%', percentage: 100})}}</span>
          </td>
          <td>{{bp.rewards_pool | formatNumber({p: 4})}}</td>
          <td>{{ bp.vote && bp.vote.staked | formatNumber({p: 0})}}</td>
          <td>
            <el-tooltip class="item" effect="dark" content="我的投票*我的投票时间/(总得票数*总投票时间)*奖励池" placement="top-end">
              <div>
                <router-link
                  class="button is-small is-outlined"
                  :to="{ name: 'claim', params: { bpname: bp.name } }"
                >
                  {{bp.vote ? bp.vote.reward : 0 | formatNumber({p: 4})}}
                </router-link>
              </div>
            </el-tooltip>
          </td>
          <td>
            <div v-show="bp.vote.unstaking === '0.0000 EOS'">-</div>
            <router-link v-show="bp.vote.unstaking !== '0.0000 EOS'" class="button is-small is-outlined" :to="{name: 'unfreeze', params: { bpname: bp.name }}">
              {{ bp.vote && bp.vote.unstaking | formatNumber({p: 0}) }}
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

export default {
  name: 'TransferRecord',
  computed: {
    table() {
      return this.account.bpsTable.filter(bp => bp.hasVote).sort((bp1, bp2) => {
        return bp2.vote.staked.split(' ')[0] - bp1.vote.staked.split(' ')[0];
      });
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
