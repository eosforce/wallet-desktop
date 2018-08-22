<template>
  <div class="box exchange-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>{{$t('时间')}}</th>
          <th>{{$t('发起方')}}</th>
          <th>{{$t('操作名')}}</th>
          <th>{{$t('接收方')}}</th>
          <th>{{$t('金额')}}</th>
          <th>{{$t('备注')}}</th>
          <th>交易状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="on_load_actions">
          <td colspan="10">
            <div class="load_area table_inner_load">
                <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力刷新')}}</div>
            </div>
          </td>
        </tr>
        <tr v-for="record in recordList" :key="record.seq" v-show="recordList.length" v-if="!on_load_actions">
          <td>{{record.time | timestamp}}</td>
          <td>{{record.from}}</td>
          <td>{{record.name}}</td>
          <td>{{record.to}}</td>
          <td>{{record.change}}</td>
          <td>{{record.memo}}</td>
          <td>
            <span v-if="last_irreversible_block_num >= record.block_num" class="has_confim">已完成</span>
            <span v-if="last_irreversible_block_num < record.block_num" class="wait_confirm">等待确认</span>
          </td>
        </tr>
        <tr v-if="!on_load_actions && !recordList.length">
          <td colspan="10">
            <div class="no_data">
              {{$t('还没有数据')}}
            </div>
          </td>
        </tr>
        <!-- <tr v-show="!recordList.length" v-if="!on_load_actions">
          <td colspan="7" class="empty">{{$t('暂无交易记录')}}</td>
        </tr> -->
      </tbody>
    </table>
      <!-- <div v-if="has_more">
        加载更多
      </div>

      <div class="no_data" v-if="!has_more">
          没有更多了
      </div> -->
      <el-pagination
        v-if="!on_load_actions && recordList.length"
        @current-change="getMaterial"
        :pageSize="offset"
        layout="prev, next, jumper"
        :total="10000">
      </el-pagination>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';
import { genTrConvertFunc } from '@/utils/util';

export default {
  name: 'TransferRecord',
  data() {
    return {
      data: [],
      list_bCurrPage: 1,
      pageSize: 20,
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
    getMaterial(val = 1) {
      this.getTransferRecord({ accountName: this.accountName, pos: this.offset * (val - 1) });
    },
    ...mapActions({
      getTransferRecord: Actions.GET_TRANSFER_RECORD,
    }),
  },
};
</script>

<style scoped>
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
.has_confim{
  color: #c0c4cc;
}
.no_data{
  text-align: center;
  padding: 20px;
}
</style>