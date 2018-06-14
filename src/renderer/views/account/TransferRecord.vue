<template>
  <div class="box exchange-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>时间</th>
          <th>发起方</th>
          <th>操作名</th>
          <th>接收方</th>
          <th>金额</th>
          <th>备注</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in recordList" :key="record.seq" v-show="recordList.length">
          <td>{{record.time | timestamp}}</td>
          <td>{{record.from}}</td>
          <td>{{record.name}}</td>
          <td>{{record.to}}</td>
          <td>{{record.change}}</td>
          <td>{{record.memo}}</td>
          <td>{{record.status}}</td>
        </tr>
        <tr v-show="!recordList.length">
          <td colspan="7" class="empty">暂无交易记录</td>
        </tr>
      </tbody>
    </table>
      <pagination :pageSize='pageSize' :currentPage='list_bCurrPage' :total='account.latestTransferNum' @pageChanged='list_bPageChanged' ref="pagination"></pagination>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { timestamp } from '@/utils/filter';
import { Actions } from '@/constants/types.constants';
import { genTrConvertFunc } from '@/utils/util';
import Pagination from '@/views/account/pagination';
export default {
  name: 'TransferRecord',
  data() {
    return {
      data: [],
      list_bCurrPage: 1,
      pageSize: 20,
    };
  },
  computed: {
    recordList() {
      if (!this.account.transferRecords || !this.account.transferRecords.length) return [];
      return this.account.transferRecords.map(tr => {
        return genTrConvertFunc(tr.action_trace.act.name)(tr);
      });
    },
    ...mapState(['account']),
    accountName() {
      return this.$route.params.accountName;
    },
  },
  methods: {
    list_bPageChanged: function(toPageStart, offset) {
      this.fetchAccout({ accountName: this.accountName, pos: toPageStart, offset: offset });
    },
    initialPageNum: function() {
      this.list_bCurrPage = 1;
      this.pageSize = 20;
      this.$refs.pagination.initialPageInation();
    },
    ...mapActions({
      fetchAccout: Actions.GET_TRANSFER_RECORD,
    }),
  },
  filters: {
    timestamp,
  },
  components: {
    Pagination,
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
</style>