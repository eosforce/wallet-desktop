<template>
  <div class="box bplist-box">
     <div class="img-box">
       <img src="@/assets/border.png" class="lt"/>
       <img src="@/assets/border.png" class="rt"/>
       <img src="@/assets/border.png" class="lb"/>
       <img src="@/assets/border.png" class="rb"/>
       <img src="@/assets/lace.png" class="lt2"/>
       <img src="@/assets/lace.png" class="rb2"/>
    </div>
    <table class="table data-table">
      <thead>
        <tr>
          <th>排名</th>
          <th>用户名</th>
          <th>佣金费率</th>
          <th>总得票数</th>
          <th>节点票龄</th>
          <th>奖池金额</th>
          <th>我的投票</th>
          <th>我的票龄</th>
          <th>待领分红</th>
          <th>赎回金额</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bp in account.bpsTable" :key="bp.name" :class="{'is-vote': bp.vote}">
          <td>{{bp.order}}</td>
          <td>{{bp.name}}</td>
          <td>{{bp.commission_rate | rate}}</td>
          <td>{{bp.total_staked | number}}</td>
          <td>{{bp.bp_voteage | voteage}}</td>
          <td>{{bp.rewards_pool | number}}</td>
          <td>{{(bp.vote && bp.vote.staked) | number}}</td>
          <td>{{(bp.vote && bp.vote.me_voteage) | voteage}}</td>
          <td>
            <el-tooltip class="item" effect="dark" content="我的投票*我的票龄/(总得票数*节点票龄)*奖励池" placement="top-end">
              <div>
                <router-link v-show="bp.vote" class="button is-small is-outlined" :to="{name: 'claim', params: { bpname: bp.name }}">{{(bp.vote && bp.vote.reward) | number}}</router-link>
                <div v-show="!bp.vote">{{(bp.vote && bp.vote.reward) | number}}</div>
              </div>
            </el-tooltip>
          </td>
          <td>
            <router-link v-show="bp.vote && bp.vote.unstaking !== '0.0000 EOS'" class="button is-small is-outlined" :to="{name: 'unfreeze', params: { bpname: bp.name }}">
              {{(bp.vote && bp.vote.unstaking) | number}}
            </router-link>
            <div v-show="!(bp.vote && bp.vote.unstaking !== '0.0000 EOS')">
              {{(bp.vote && bp.vote.unstaking) | number}}
            </div>
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
import { mapState, mapGetters } from 'vuex';

import { Getters } from '@/constants/types.constants';
import { number, rate, voteage } from '@/utils/filter';

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
    voteage,
  },
};
</script>

<style scoped>
/* .table td .button.is-small, .table th .button.is-small{
     margin-bottom: 5px
  } */
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
