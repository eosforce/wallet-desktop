<template>
  <div class="box exchange-box">
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
        <!--<tr v-for="(record,index) in account.transferRecords" :key="index">
            <td>{{record.block_time | timestamp}}</td>
            <td>{{record.from}}</td>
            <td>{{record.name}}</td>
            <td>{{record.to}}</td>
            <td>{{record.quantity}}</td>
            <td>{{record.remark}}</td>
            <td>{{record.status}}</td>
        </tr>-->
            </tbody>
        </table>
        <pagination  :pageSize='pageSize' :currentPage='list_bCurrPage'  :total='account.latestTransferNum' @pageChanged='list_bPageChanged'></pagination>
    </div>
</template>

<script>
    import {mapState, mapGetters,mapActions} from 'vuex'

    import { Actions, Getters } from '@/constants/types.constants'
    import {timestamp} from '@/utils/filter'
    import { genTrConvertFunc } from '@/utils/util'
    import Pagination from '@/views/account/pagination'
    export default {
        name: 'TransferRecord',
        data() {
            return {
                data: [],
                list_bCurrPage: 1,
                list_aTotal: 20,
                size:30,
                pageSize:20
            }
        },
        computed: {
	recordList() {
      if (!this.account.transferRecords || !this.account.transferRecords.length) return []
      return this.account.transferRecords.map(tr => {
        return genTrConvertFunc(tr.action_trace.act.name)(tr)
      })
    },
            ...mapState(['account']),
            accountName() {
                return this.$route.params.accountName
            },
        },
        filters: {
            timestamp,
        },
        methods: {
            list_bPageChanged: function (toPageStart, offset) {
                console.log("toPageStart: " + toPageStart);
                console.log("offset: " + offset);
                this.fetchAccout({ accountName: this.accountName , pos: toPageStart,  offset: offset})
            },
            getTotal: function (transferRecords) {
                console.log( "list_aTotal:" + this.list_aTotal)
                this.list_aTotal = transferRecords.size;
                return this.list_aTotal ;
            },
            ...mapActions({
                fetchAccout: Actions.GET_TRANSFER_RECORD,
            }),
        },
        components:{
            Pagination
        }
}
</script>

<style scoped>
.empty {
 height: 100px;
 line-height: 100px;
 color:#999 !important;
 font-size: 20px;
 font-weight: normal
}
</style>