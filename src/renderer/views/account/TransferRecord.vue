<template>
  <div class="box exchange-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>时间</th>
          <th>发起方</th>
          <th>操作名</th>
          <th>接收方</th>
          <th>数据描述</th>
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
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

import { timestamp } from '@/utils/filter';
import { Getters } from '@/constants/types.constants';
import { genTrConvertFunc } from '@/utils/util';

export default {
  name: 'TransferRecord',
  computed: {
    recordList() {
      if (!this.account.transferRecords || !this.account.transferRecords.length) return [];
      return this.account.transferRecords.map(tr => {
        return genTrConvertFunc(tr.action_trace.act.name)(tr);
      });
    },
    ...mapState(['account']),
  },
  filters: {
    timestamp,
  },
  methods: {},
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