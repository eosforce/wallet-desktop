<template>
  <div class="box bplist-box">
    <!-- {{ MY_FIX_VOTES }} -->
    <table class="table data-table">
      <thead>
        <tr>
          <th class="t-left">{{$t('排名')}}</th>
          <th class="t-left">{{$t('节点名')}}</th>
          <th>{{$t('投票期限')}}</th>
          <th>{{$t('投票数量')}}</th>
          <th>{{$t('已产生分红')}}</th>
          <th>{{$t('预计到期时间')}}</th>
          <th>{{$t('状态')}}</th>
          <th>{{$t('操作')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in MY_FIX_VOTES.rows">
          <td>{{ row }}</td>
          <td class="t-left">{{ row.key + 1 }}</td>
          <td class="t-left">{{ row.bpname }}</td>
          <td>{{ fix_vote_types[row.fvote_typ] }}</td>
          <td>{{ row.vote.split(' ')[0] }}</td>
          <td>{{row.reward | formatNumber({p: 4})}}</td>
          <td>{{ row.finish_time }}</td>
          <td>{{ row.is_withdraw ? '已完成' : '进行中' }}</td>
          <td>
            <a href="" class="button is-small is-outlined" v-if="row.is_withdraw ">撤回</a>
            <el-tooltip :content="$t('正在进行中，无法撤回')" effect="dark" placement="top-end">
              <a href="" class="button is-small is-outlined grey-button" v-if="!row.is_withdraw ">撤回</a>
            </el-tooltip>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="MY_FIX_VOTES.more" class="load_end_action_ct">
        <a class="load_action" v-if="!MY_FIX_VOTES.on_load && MY_FIX_VOTES.more" @click="next">加载更多</a>
        <div class="load_area table_inner_load" v-if="MY_FIX_VOTES.on_load">
            <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力加载')}}</div>
        </div>
    </div>
    <div class="no_data sm_no_data" v-if="!MY_FIX_VOTES.more">
        没有更多了
    </div>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { toUrl, complete_num_with_zero, calcVoteage, calcReward } from '@/utils/util';
import { Actions } from '@/constants/types.constants';

export default {
  name: 'MyFixVote',
  data () {
    return {
      fix_vote_types: {
        'fvote.a': 90,
        'fvote.b': 180,
        'fvote.c': 360,
        'fvote.d': 720
      },
    }
  },
  computed: {
    table(){
      return this.account.bpsTable.filter(bp => bp.hasVote || bp.hasrRamvote);
      // return this.account.bpsTable.filter(bp => bp.hasVote || bp.hasrRamvote).sort((bp1, bp2) => {
      //   return bp2.vote.staked.split(' ')[0] - bp1.vote.staked.split(' ')[0];
      // });
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
    bpsTable () {
      return this.account.bpsTable;
    },
    MY_FIX_VOTES () {
      let data = JSON.parse( JSON.stringify( this.account.fix_votes_table ) );

      data.rows.forEach(row => {
        row.latest_block_num = row.withdraw_block_num - this.head_block_num;

        // calculate my reward
        const myVoteage = calcVoteage([row.votepower_age.age, row.votepower_age.staked, this.head_block_num, row.votepower_age.update_height]);
        row.myVoteage = myVoteage;

        let bp_item = this.bpsTable.find(i => i.name == row.bpname);
        const reward = calcReward([myVoteage, bp_item.bpVoteage, bp_item.rewards_pool]);
        row.reward = reward;
        row.rewards_pool = bp_item.rewards_pool;

        if(row.latest_block_num >= 0){
          let finish_time = new Date( row.latest_block_num * 3 * 1000 + new Date().getTime() );
          let year    = complete_num_with_zero(finish_time.getFullYear()),
              month   = complete_num_with_zero(finish_time.getMonth() + 1),
              date    = complete_num_with_zero(finish_time.getDate()),
              hours   = complete_num_with_zero(finish_time.getHours()),
              minutes = complete_num_with_zero(finish_time.getMinutes()),
              seconds = complete_num_with_zero(finish_time.getSeconds());

          row.finish_time = `${ year }-${ month }-${ date } ${ hours }:${ minutes }:${ seconds }`;

        }else{
          row.finish_time = -1
        }

      });
      return data;
    },
    ...mapState(['account', 'app', 'wallet']),
  },
  watch: {
    'account.accountName' () {
      this.reload_fix_votes_table();  
    }
  },
  mounted () {
    // reload_fix_votes_table
    this.reload_fix_votes_table();
  },
  methods: {
    next () {
      this.QUERY_FIX_VOTES_TABLE();
    },

    isLock(unstakeHeight) {
      if (unstakeHeight === undefined) return false;
      return unstakeHeight + 86400 - this.head_block_num > 0;
    },
    toUrl(url) {
      return toUrl(url);
    },
    ...mapActions({
      QUERY_FIX_VOTES_TABLE: Actions.QUERY_FIX_VOTES_TABLE,
      reload_fix_votes_table: 'reload_fix_votes_table'
    }),
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
