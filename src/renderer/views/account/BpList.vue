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
          <th>节点用户名</th>
          <th>总得票数</th>
          <th>奖池金额</th>
          <th>手续费率</th>
          <th>我的投票</th>
          <th>节点票龄</th>
          <th>待领取分红</th>
          <th>赎回金额</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="bp in account.bpsTable" :key="bp.name" :class="{'is-vote': bp.vote}">
          <td>{{bp.order}}</td>
          <td>{{bp.name}}</td>
          <td>{{bp.total_staked | number}}</td>
          <td>{{bp.rewards_pool | number}}</td>
          <td>{{bp.commission_rate | rate}}</td>
          <td>{{(bp.vote && bp.vote.staked) | number}}</td>
          <td>{{bp.average | msToDay}}</td>
          <td>{{(bp.vote && bp.vote.reward) | number}}</td>
          <td>{{(bp.vote && bp.vote.unstaking) | number}}</td>
          <td>
            <!-- <select name="selected">
                <option value="投票"><router-link class="button is-small is-outlined" :to="{name: 'vote', params: { bpname: bp.name }}">投票</router-link></option>
                <option value="解除冻结"><router-link v-show="bp.vote" class="button is-small is-outlined" :to="{name: 'unfreeze', params: { bpname: bp.name }}">解除冻结</router-link></option>
                <option value="提取分红"> <router-link v-show="bp.vote" class="button is-small is-outlined" :to="{name: 'claim', params: { bpname: bp.name }}">提取分红</router-link></option>
            </select>   -->
            <router-link class="button is-small is-outlined" :to="{name: 'vote', params: { bpname: bp.name }}">投票</router-link>
            <router-link v-show="bp.vote && bp.vote.unstaking !== '0.0000 EOS'" class="button is-small is-outlined" :to="{name: 'unfreeze', params: { bpname: bp.name }}">解冻</router-link>
            <router-link v-show="bp.vote" class="button is-small is-outlined" :to="{name: 'claim', params: { bpname: bp.name }}">领奖</router-link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

import { Getters } from '@/constants/types.constants'
import { number, rate, msToDay } from '@/utils/filter'

export default {
  name: 'TransferRecord',
  data() {
    return {}
  },
  computed: {
    ...mapState(['account']),
  },
  filters: {
    number,
    rate,
    msToDay,
  },
}
</script>

<style scoped>
  /* .table td .button.is-small, .table th .button.is-small{
     margin-bottom: 5px
  } */
  .button{
     padding-left: calc(0.625em - 1px);
    padding-right: calc(0.625em - 1px);
  }
</style>
