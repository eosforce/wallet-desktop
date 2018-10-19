<template>
  <div class="box bplist-box" style="font-size:14px;">
    <!-- kr -->
    <div v-if="$i18n.locale === 'kr'">
      <div class="rate">
        <span><b>총자산:</b></span>
        <p class="dec">
        총자산 = 사용 가능한 잔액 + 총 투표 수  + 총 상환 + 총 배당금 <br>
        </p>
      </div>
      <div class="rate">
        <span><b>배당 비율:</b></span>
        <p class="dec">
          배당 비율 = 100% - 수수료율<br>
        </p>
      </div>
      <div class="rate">
        <span><b>연간 이자율:</b></span>
        <p class="dec">
          화폐 발행액는10억EOS <br/>
          당 3s하나의 블록，당 하나의 블록모든 수익노드(투표 가 0.5%보다 많기) 장려 9 EOSC<br/>
          매일수익노드장려= 9 * 20 * 60 * 24 = 259,200 EOSC<br/>
          매수익노드장려= 슈퍼 노드다매일장려 * 365 = 94,608,000 EOSC<br/>
          거중에70%노드장려지에 넣다，30%수익배분은 다음과 같다：<br/>
          전23명슈퍼 노드다수익15%는기본급으로 그 계좌에 들어가다,수익15%는그 계좌에블록체인나온다. 나머지는후보 절기,수익15%는기본급으로 그 계좌에 들어가다, 수익15%는EOSForce 재단 계좌에 들어가다.<br/>
          투표연간이율=（매수익노드장려*70%*득표율*배당 비율）/투포하는노드총 득표수*100%
        </p>
      </div>
      <div class="rate">
        <span><b>구속:</b></span>
        <p class="dec">
          나의 최근 티켓 나이 = 내 누적 티켓 연령 + 내 누적 티켓 연령... * (내 표... - 내 티켓 연령 업데이트 시간)<br>
          노드 최신 티켓 연령 = 노드 축적 티켓 연령 + 총 투표 수 * (현재 시간 - 노드 티켓 보존 기간 갱신)<br>
          사용 금액 = （나의 최근 티켓 나이 / 노드 최신 티켓 연령） * 상금 금액<br>
          투표를 변경할 때마다 누적 된 티켓 연령과 누적 티켓 연령을 업데이트 할 것이며, 배당금을받을 때마다 누적 된 티켓 연령을 지울 것입니다.
        </p>
      </div>
      <div class="rate">
        <span><b>BlockOne 잠금 해제：</b></span>
        <p class="dec">
          3 초당 1 블록, BlockOne 1 EOS에서 각 블록 잠금 해제 <br>
          BlockOne은 매년 잠금 해제합니다. =  1 * 20 * 60 * 24 * 365 = 10,512,000 EOS<br>
          10 년마다 약 1 억 명의 EOS 잠금 해제, 10 년 후 잠금 해제 계속
        </p>
      </div>
    </div>
    <!-- zh -->
    <div v-if="$i18n.locale === 'zh'">
      <div class="rate">
        <span><b>资产总额:</b></span>
        <p class="dec">
        资产总额 = 可用余额 + 投票总额  + 赎回总额 + 待领分红总额 <br>
        </p>
      </div>
      <div class="rate">
        <span><b>分红比例:</b></span>
        <p class="dec">
          分红比例 = 100% - 佣金比例<br>
        </p>
      </div>
      <div class="rate">
        <span><b>年化利率:</b></span>
        <p class="dec">
          链初始发行量为 10 亿 EOS<br>
          每 3s 一个块，每个块为所有收益节点（投票大于0.5%）奖励 9 EOSC<br>
          收益节点每日奖励 = 9 * 20 * 60 * 24 = 259,200 EOSC<br>
          收益节点每年奖励 = 超级节点每日奖励 * 365 = 94,608,000 EOSC<br>
          其中70%收益进入分红池，30%收益分配如下：<br>
          前23名为超级节点，收益的15%作为基本工资进入其账户,收益的15%作为出块奖励进入其账户。 其余为候选节点，收益的15%作为基本工资进入其账户,收益的15%进入原力基金会账户。<br> 
          投票年化利率 = （收益节点每年奖励*70%*得票率*分红比例）/ 所投节点总得票数 * 100%
        </p>
      </div>
      <div class="rate">
        <span><b>待领分红:</b></span>
        <p class="dec">
          我的最新票龄 = 我的累计票龄 + 我的投票 * (当前时间 - 我的票龄更新时间)<br>
          节点最新票龄 = 节点累计票龄 + 总得票数 * (当前时间 - 节点票龄更新时间)<br>
          待领分红金额 = （我的最新票龄 / 节点最新票龄） * 奖池金额<br>
          每次修改投票会更新我的累计票龄和节点累计票龄，每次领取分红会清零我的累计票龄
        </p>
      </div>
      <div class="rate">
        <span><b>BlockOne 解锁：</b></span>
        <p class="dec">
          每 3s 一个块，每个块为BlockOne解锁 1 EOS <br>
          BlockOne每年解锁 =  1 * 20 * 60 * 24 * 365 = 10,512,000 EOS<br>
          每10年解锁约 1 亿 EOS，10年以后继续解锁，永不间断
        </p>
      </div>
    </div>
    <!-- en -->
    <div v-if="$i18n.locale === 'en'">
      <div class="rate">
        <span><b>Total asset:</b></span>
        <p class="dec">
        Total asset=available balance+ overall vote+ fund redemption+ dividends to be claimed <br>
        </p>
      </div>
      <div class="rate">
        <span><b>Dividend payout ratio:</b></span>
        <p class="dec">
          Dividend payout ratio=100 percent — commission rate<br>
        </p>
      </div>
      <div class="rate">
        <span><b>Annual rate of return:</b></span>
        <p class="dec">
        Initial supply: 1,000,000,000 EOS<br/>
        Blocks are produced at 3 blocks/second. Every block rewards all productive nodes (with more than 0.5% of the total network votes) with 9 EOSC<br/>
        Daily reward of a productive node = 9 * 20 * 60 * 24 = 259,200 EOSC<br/>
        Annual reward of a productive node = daily reward * 365 = 94,608,000 EOSC<br/>
        70% of the reward goes into the reward pool, and the rest 30% is distributed as followed:<br/>
        For the top 23 Super Node, 15% goes into their individual account as overhead, and the other 15% is received as block reward. For the candidate nodes, 15% goes into their individual account as overhead, and the other 15% is deposited in the EOSForce Foundation account.<br/>

        Voting annual rate = (ann. reward of profitable node * 70% * network votes received percentage * bonus rate) / total votes received * 100%<br/>
          
        </p>
      </div>
      <div class="rate">
        <span><b>Dividend to be claimed:</b></span>
        <p class="dec">
          My newest coinage = my cumulative coinage + my vote * (recent height – my coinage update height)<br>
          BP newest coinage = BP cumulative coinage + BP total vote * (recent height –BP coinage update height)<br>
          Unclaimed dividends = (My newest coinage / BP newest coinage) * rewards pool<br>
          My accumulated voting age and BP cumulative coinage swill be updated every time I change the voting, and my accumulated voting age will be reset every time I receive the bonus
        </p>
      </div>
      <div class="rate">
        <span><b>BockOne Unlock：</b></span>
        <p class="dec">
          3s peer block, each block can unlock 1 EOS to BlockOne<br>
          Annual unlock for BlockOne = 1 * 20 * 60 * 24 * 365 = 10,512,000 EOS<br>
          About 100 million EOS are unlocked every 10 years, and continue to be unlocked after 10 years without interruption
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RateInstructions',
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
