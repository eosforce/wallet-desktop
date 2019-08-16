<template>
  <div class="box bplist-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th class="t-left">{{$t('排名')}}</th>
          <th class="t-left">{{$t('节点社区')}}</th>
          <th class="t-left">{{$t('节点名')}}</th>
          <th>{{$t('分红比例')}}</th>
          <th>{{$t('得票总数')}}</th>
          <th>{{$t('年化利率')}}</th>
          <th>{{$t('奖池金额')}}</th>
          <th>{{$t('我的投票')}}</th>
          <th v-if="HAS_CLAIM">{{$t('待领分红')}}</th>
          <th v-if="VOTE_BACK_STATE">{{$t('赎回金额')}}</th>
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
        <tr v-for="bp in table" :key="bp.name" :class="{'is-vote': bp.hasVote}" v-if="!on_load_bps_table">
          <td class="t-left">
            <el-tooltip :content="$t('正在出块')" placement="left" v-show="app.currentNodeInfo.head_block_producer === bp.name">
              <img src="@/assets/loader/producing.svg" width="20">
            </el-tooltip>
            <div v-if="app.currentNodeInfo.head_block_producer !== bp.name">{{bp.order}}</div>
          </td>
          <td class="t-left">
            <a @click="$electron.shell.openExternal(toUrl(bp.url))" style="color: #3273dc">
              {{($i18n.locale && app.bpNicks[$i18n.locale] && app.bpNicks[$i18n.locale][bp.name]) || bp.name}}
            </a>
          </td>
          <td class="t-left">{{bp.name}}</td>
          <td>{{10000 - bp.commission_rate | formatNumber({p: 2, sign: '%', percentage: 0.01})}}</td>
          <td>{{bp.total_staked | formatNumber({p: 0})}}</td>
          <td>
            <span v-show="bp.order >= 24">-</span>
            <span v-show="bp.order < 24">{{bp.adr | formatNumber({p: 0, sign: '%', percentage: 100})}}</span>
          </td>
          <td>{{bp.rewards_pool | formatNumber({p: 4})}}</td>
          <td>
                {{ calculate_fixed_votes_by_bpname(bp.name).plus( get_bp_vote(bp).toString()) | formatNumber({p: 0}) }}
          </td>
          <td v-if="HAS_CLAIM">
            <el-tooltip class="item" effect="dark" :content="$t('我的投票*我的投票时间/(总得票数*总投票时间)*奖励池')" placement="top-end">
              <div>
                <router-link
                  class="button is-small is-outlined"
                  :to="{ name: 'claim', params: { bpname: bp.name } }"
                >
                  {{ calculate_fixed_reward_by_bpname(bp.name).plus( get_bp_reward(bp) ) | formatNumber({p: 4}) }}
                </router-link>
              </div>
            </el-tooltip>
            
          </td>
          <td v-if="VOTE_BACK_STATE">
            <template v-if="bp.vote">
              <div v-show="bp.vote.unstaking === '0.0000 EOS'">-</div>
              <router-link v-show="bp.vote.unstaking !== '0.0000 EOS'" class="button is-small is-outlined" :class="{'grey-button': isLock(bp.vote.unstake_height)}" :to="{name: 'unfreeze', params: { bpname: bp.name }}">
                {{ (bp.vote ? bp.vote && bp.vote.unstaking : '0') | formatNumber({p: 0}) }}
              </router-link>
            </template>
          </td>
          <td>
            <router-link class="button is-small is-outlined is-modify" :to="{name: 'vote', params: { bpname: bp.name }}">
              {{$t('修改投票')}}
            </router-link>
          </td>
        </tr>
        <tr v-if="!on_load_bps_table && !table.length">
          <td colspan="12">
            <div class="no_data">
              {{$t('还没有数据')}}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { 
  toUrl, 
  calculate_fixed_votes_by_bpname, 
  calcute_fixed_reward,
  toBigNumber,
  calculate_fixed_reward_by_bpname
} from '@/utils/util';

export default {
  name: 'TransferRecord',
  computed: {
    table(){
      let data = this.account.bpsTable.filter(bp => (bp.hasVote || bp.hasrRamvote) || this.MY_FIX_VOTES.rows.find(i => i.bpname == bp.name));
      data = JSON.parse( JSON.stringify(data) );
      return data;
    },
    bpsTable () {
      return this.account.bpsTable;
    },
    MY_FIX_VOTES () {
      let data = JSON.parse( JSON.stringify( this.account.fix_votes_table ) );

      calcute_fixed_reward(data, this.head_block_num, this.bpsTable);

      return data;
    },
    on_load_bps_table(){
      return this.account.on_load_bps_table;
    },
    head_block_num(){
      return this.app.currentNodeInfo.head_block_num;
    },
    VOTE_BACK_STATE () {
      return this.wallet.VOTE_BACK_STATE;
    },
    HAS_CLAIM () {
      return this.wallet.HAS_CLAIM;
    },
    ...mapState(['account', 'app', 'wallet']),
  },
  watch: {
    'account.accountName' () {
      this.QUERY_FIX_VOTES_TABLE();  
    }
  },
  mounted () {
    this.QUERY_FIX_VOTES_TABLE();  
  },
  methods: {
    isLock(unstakeHeight) {
      if (unstakeHeight === undefined) return false;
      return unstakeHeight + 86400 - this.head_block_num > 0;
    },
    calculate_fixed_reward_by_bpname (bpname) {
      let bp_votes = this.MY_FIX_VOTES.rows.filter(i => i.bpname == bpname);
      let total = toBigNumber(0);
      bp_votes.forEach(i => {
        total = total.plus( i.reward );
      });
      return total;
    },
    calculate_fixed_votes_by_bpname (bpname) {
      let bp_votes = this.MY_FIX_VOTES.rows.filter(i => i.bpname == bpname);
      let total_votes = toBigNumber(0);
      bp_votes.forEach(row => {
        total_votes = total_votes.plus( toBigNumber(row.vote.split(' ')[0]) );
      });
      return total_votes;
    },
    get_bp_vote (bp) {
      return toBigNumber(bp.vote && bp.vote.vote ? bp.vote.vote : (bp.vote && bp.vote.staked ? bp.vote.staked : 0));
    },
    get_bp_reward (bp){
      return toBigNumber( bp.vote ? bp.vote.reward * 1 > 0 ? bp.vote.reward : 0 : 0 );
    },
    toUrl(url) {
      return toUrl(url);
    },
    toBigNumber,
    ...mapActions({
      QUERY_FIX_VOTES_TABLE: 'QUERY_FIX_VOTES_TABLE'
    })
  },
};
</script>

<style scoped>
.table td .button.grey-button {
  background: #ddd;
  color: #363636;
}
.item{
  display: inline-block;
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

.table td .button.is-small.is-modify {
  background: transparent;
  color: #408ee1;
  border: 1px solid #408ee1;
}
</style>
