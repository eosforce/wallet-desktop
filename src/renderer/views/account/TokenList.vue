<template>
  <div class="box bplist-box">
    <table class="table data-table">
      <thead>
        <tr>
          <th>{{$t('序号')}}</th>
          <th>{{$t('符号')}}</th>
          <th>{{$t('发行人')}}</th>
          <th class="t_l">{{$t('最大发行量')}}</th>
          <th class="t_l">{{$t('目前发行量')}}</th>
          <th>{{$t('我的余额')}}</th>
          <th>{{$t('操作')}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="on_load_token">
          <td colspan="10">
            <div class="load_area table_inner_load">
                <div class="load_circle account_detail_loader"></div><div>{{$t('正在努力刷新')}}</div>
            </div>
          </td>
        </tr>
        <tr v-for="(token, index) in account.tokenList" :key="token.token" v-if="!on_load_token">
          <td>{{index + 1}}</td>
          <td>({{token.symbol}}, {{token.precision}})</td>
          <td>{{token.issuer}}</td>
          <td class="t_l">
            {{ split_long_num(token.max_supply) + ' ' + token.symbol }}
          </td>
          <td class="t_l">
            {{ split_long_num(token.supply) + ' ' + token.symbol }}
          </td>
          <td>{{ split_long_num(token.balance) + ' ' + token.symbol }}</td>
          <td>
            <router-link class="button is-small is-outlined" :to="{name: 'tokenTransfer', params: { symbol: token.symbol, precision: token.precision }}">{{ $t('转账') }}</router-link>
          </td>
        </tr>

        <tr v-if="!on_load_token && !account.tokenList.length">
          <td colspan="10">
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
import { Actions } from '@/constants/types.constants';
import {
  split_long_num
} from '@/utils/util.js'
export default {
  name: 'TokenList',
  computed: {
    accountName() {
      return this.$route.params.accountName;
    },
    on_load_token() {
      return this.account.on_load_token;
    },
    ...mapState(['account']),
  },
  mounted () {
    this.GET_TOKEN_LIST({accountName: this.accountName});
  },
  watch: {
    accountName () {
      this.GET_TOKEN_LIST({accountName: this.accountName});
    }
  },
  methods: {
    ...mapActions({
      GET_TOKEN_LIST: Actions.GET_TOKEN_LIST,
    }),
    split_long_num
  }
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
/* .bplist-box tbody .is-vote{
  display: none;
} */
.t_l {
  text-align: right !important;
}
</style>
