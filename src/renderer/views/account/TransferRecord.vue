<template>
  <div class="box exchange-box">

    <div class="load_end_action_ct load_top_action_ct" v-if="on_load_actions && recordList.length">
    <!-- <div class="load_end_action_ct load_top_action_ct"> -->
      <div class="load_area table_inner_load">
          <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力加载')}}</div>
      </div>
    </div>

    <table class="table data-table">
      <thead>
        <tr>
          <th>{{$t('时间')}}</th>
          <th>{{$t('合约账户')}}</th>
          <th>{{$t('发起方')}}</th>
          <th>{{$t('操作名')}}</th>
          <th>{{$t('接收方')}}</th>
          <th>{{$t('金额')}}</th>
          <th>{{$t('备注')}}</th>
          <th>{{$t('交易状态')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="on_load_actions && !recordList.length">
          <td colspan="10">
            <div class="load_area table_inner_load">
                <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力刷新')}}</div>
            </div>
          </td>
        </tr>
        <tr class="tr_record" v-for="record in recordList" :key="record.seq" v-show="recordList.length" v-if="recordList.length">
          <td>{{record.time | timestamp}}</td>
          <td>{{record.account}}</td>
          <td>{{record.from}}</td>
          <td>{{record.name}}</td>
          <td>{{record.to}}</td>
          <td>{{ symblo_change(record.change) }}</td>
          <td class="transfer_memo">
              {{record.memo}}
          </td>
          <td>
            <div v-if="record.status == 'finished'" class="record_status">
              {{ $t('已完成') }}
            </div>
            <div v-if="record.status == 'on_process'" class="record_status">
              {{ $t('确认区块中') }}
            </div>
            <div v-if="record.status == 'unfinished'" class="record_status">
              {{ $t('交易失败') }}
            </div>
          </td>
        </tr>
        <tr v-if="!on_load_actions && !recordList.length">
          <td colspan="10">
            <div class="no_data">
              {{$t('还没有数据')}}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
      <div v-if="has_more && !on_load_actions" class="load_end_action_ct">
        <a class="load_action" v-if="!on_load_more" @click="next">加载更多</a>
        <div class="load_area table_inner_load" v-if="on_load_more">
            <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力加载')}}</div>
        </div>
      </div>
      <div class="no_data sm_no_data" v-if="!has_more && recordList.length">
          没有更多了
      </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';
import { genTrConvertFunc, symblo_change } from '@/utils/util';

export default {
  name: 'TransferRecord',
  data() {
    return {
      list_bCurrPage: 1,
      pageSize: 20,
      on_load_more: false
    };
  },
  mounted() {
    this.getMaterial();
  },
  watch: {
    accountName () {
      this.getMaterial();
    }
  },
  computed: {
    offset() {
      return this.account.transferRecords ? this.account.transferRecords.offset : 20;
    },
    recordList() {
      if (!this.account.transferRecords.list || !this.account.transferRecords.list.length) return [];
      return this.account.transferRecords.list.map(tr => {
        return genTrConvertFunc(tr.action_trace.act.name, this.last_irreversible_block_num)(tr);
      });
    },
    has_more() {
      return this.account.transferRecords.more;
    },
    accountName() {
      return this.$route.params.accountName;
    },
    last_irreversible_block_num() {
      return this.app.currentNodeInfo.last_irreversible_block_num;
    },
    on_load_actions() {
      return this.account.on_load_actions;
    },
    ...mapState(['account', 'app']),
  },
  methods: {
    next() {
      this.on_load_more = true;
      this.getTransferRecord({ 
        accountName: this.accountName, 
        finished: () => {
          this.on_load_more = false;
        }
      });
    },
    getMaterial(val = 1) {
      this.getTransferRecord({ accountName: this.accountName });
    },
    symblo_change,
    ...mapActions({
      getTransferRecord: Actions.GET_TRANSFER_RECORD,
      RESET_ACCOUNT_INFO: Actions.RESET_ACCOUNT_INFO
    }),
  },
};
</script>

<style scoped>

.table td{
  vertical-align: middle;
  padding: 10px 5px;
}
.table .tr_record:hover{
  background-color: #f5f5f5;
}
.transfer_memo{
  max-width: 200px;
  word-break: break-word;
}

.empty {
  height: 100px;
  line-height: 100px;
  color: #999 !important;
  font-size: 20px;
  font-weight: normal;
}
.el-pagination {
  text-align: center;
}
.wait_confirm{
  color: #900e0e;
}
.record_status{
  display: block;
  min-width: 80px;
  color: #c0c4cc;
  text-align: center;
}
.no_data{
  text-align: center;
  padding: 20px;
}
</style>