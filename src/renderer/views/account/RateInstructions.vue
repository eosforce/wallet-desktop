<template>
  <div class="box bplist-box">
    <div class="rate">
      <span><b>资产总额:</b></span>
      <p class="dec">
       资产总额 = 可用余额 + 投票总额 + 待领分红总额 + 赎回总额 <br>
      </p>
    </div>
    <div class="rate">
      <span><b>年化利率:</b></span>
      <p class="dec">
        每 3s 一个块，每个块奖励 9 EOS <br>
        链每天增发 = 9 * 20 * 60 * 24 = 259,200 EOS <br>
        链每年增发 =  链每天增发 * 365 = 94,608,000 EOS <br>
        投票年化利率 = （链每年增发 / 23 * 分红比率） / 总得票数 * 100%
      </p>
    </div>
    <div class="rate">
      <span><b>分红比例:</b></span>
      <p class="dec">
        分红比例 = 100% - 佣金比例<br>
      </p>
    </div>
    <div class="rate">
      <span><b>待领分红:</b></span>
      <p class="dec">
        我的最新票龄 = 我的累计票龄 + 我的投票 * (最新块高度 - 我的票龄更新高度)<br>
        节点最新票龄 = 节点累计票龄 + 总得票数 * (最新块高度 - 节点票龄更新高度)<br>
        待领分红金额 = （我的最新票龄 / 节点最新票龄） * 奖池金额
      </p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

import { number, rate, voteage, yearrate } from '@/utils/filter';

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
    yearrate,
    voteage,
  },
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
.rate {
  margin-bottom: 20px;
}

.dec {
  margin-top: 10px;
}
</style>
