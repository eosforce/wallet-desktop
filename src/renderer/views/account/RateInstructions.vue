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

          연간 이자율 : 체인 초기 발행량 10억 EOSC<br/>
          3초에 1블록이 생성되며, 블록 한 개당 모든 수익 노드(득표율 0.5 % 초과)는 총 3 EOSC를 나눠갖습니다.<br/>
          수익 노드 일일 보상 = 3 * 20 * 60 * 24 = 86,400 EOSC<br/>
          수익 노드 연간 보상 = 수입 노드 일일 보상 * 365 = 31,536,000 EOSC<br/>
          노드 수익금의 70 %는 사용자 배당금 풀에 들어가며, 나머지 30 %는 다음과 같이 분배됩니다.<br/>
          상위 23 위를 슈퍼 노드라고하며 수익금의 15 %가 기본 수입 명목으로 계정에 들어가며, 수익금의 나머지 15 %는 블록 생성 보상 명목으로 계정에 들어갑니다. 나머지 비 슈퍼노드의 경우 수익금의 15 %는 기본 수입 명목으로 계정에 들어가고, 수익금의 나머지 15%는 FORCE 커뮤니티 개발자 위원회 계정에 들어갑니다.<br/>
          투표 연간 이자율 = (수익 노드 연간 보상 * 70 % * 투표율 * 배당 비율) / 투표 한 노드의 전체 투표 * 100 %<br/>
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
          年化利率:链初始发行量为 10 亿 EOSC<br>
          每 3s 一个块，所有收益节点（投票大于0.5%）奖励共 3 EOSC <br>
          收益节点每日奖励 = 3 * 20 * 60 * 24 = 86,400 EOSC<br>
          收益节点每年奖励 = 收益节点每日奖励 * 365 = 31,536,000 EOSC<br>
          其中70%收益进入分红池，30%收益分配如下：<br>
          前23名为超级节点，收益的15%作为基本工资进入其账户,收益的15%作为出块奖励进入其账户。 <br>其余非超级节点的收益节点，收益的15%作为基本工资进入其账户,收益的15%进入原力社区开发者委员会账户。<br>
          投票年化利率 = （收益节点每年奖励*70%*得票率*分红比例）/ 所投节点总得票数 * 100%<br>
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
        Blocks are produced at 3 blocks/second. Every block rewards all productive nodes (with more than 0.5% of the total network votes) with 3 EOSC<br/>
        Daily reward of a productive node = 3 * 20 * 60 * 24 = 86,400 EOSC<br/>
        Annual reward of a productive node = daily reward * 365 = 31,536,000 EOSC<br/>
        70% of the reward goes into the reward pool, and the rest 30% is distributed as followed:<br/>
        For the top 23 Super Node, 15% goes into their individual account as overhead, and the other 15% is received as block reward. For the Non-BP Nodes that also receive  rewards , 15% goes into their individual account as overhead, and the other 15% is deposited in the EOSForce Developers Committee account.<br/>
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
