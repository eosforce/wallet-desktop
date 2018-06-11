<template>
  <header class="page-header" style="-webkit-app-region: drag;">
    <div class="brand">
      <router-link class="brand__link" :to="{name: 'dashboard'}"><img src="@/assets/logo.png" class="logo"/></router-link>
    </div>
    <div class="header-navbar">
      <div class="select">
        <select v-model="nodeValue">
          <option :value="node.value" v-for="node in app.nodeList" :key="node.value">{{node.name}}</option>
        </select>
      </div>
      <div class="block">
          出块节点:<span>{{nodeInfo.head_block_producer}}</span>
          最新高度:<span>{{nodeInfo.head_block_num}}</span>
          <span class="refresh" @click="refreshApp()"><img src="@/assets/refresh.png"></span>
        <span class="refresh" @click="showActivity">活动</span>
      </div>
    </div>
    <div class="page-activity" v-show="showActivityPage">
      <div class="ac-head"><span @click="hideActivity">X</span></div>
      <div class="ac-body">
        <div class="ac-title">公测奖励说明</div>
        <div class="ac-sub-title">1.公测全额奖：前1000公测用户在指定表单中提交eosforcewallet的公钥，可获奖励20枚主网代币 </div>
        <div class="ac-sub-title">2.每日大奖：6月11日-15日期间，将从参与投票的用户中（用户需要在指定表单中提交公钥），每日抽取一等奖、二等奖、三等奖各一名；分别奖励1000枚、600枚、400枚主网代币</div>
        <div class="ac-sub-title">3.奖励代币来源：奖励代币均为eosforce启动的eos主网代币，来自于首周默认节点出块的奖励</div>
        <!--<div class="ac-item">①资格：仅限初始测试币为666枚的用户；领取时间需要在6月11日12：00之后。</div>
        <div class="ac-item">②参与方式：可在eosforcewallet钱包中投票获取分红，截止6月20日12：00根据用户总资产进行排名，排名奖励细则看下图。</div>
        <div class="ac-item">③注意：参与投票分红排位赛的账户不得进行转账操作，经发现总资产中有转入记录取消排位赛资格。</div>-->
        <div class="ac-sub-title">4.扫二维码加入微信社群，领取测试币</div>
        <div class="ac-sub-title">5.公测期间，切勿导入eos私钥</div>
        <div class="ac-sub-title">6.此次活动最终解释权归eosforce.io所有</div>
        <!--<div class="ac-title">公测奖励</div>
        <div class="ac-sub-title">公测全额奖：前1000名奖励20枚代币</div>
        <div class="ac-sub-title">投票分红排位赛：</div>
        <div class="ac-bonus-body">
          <div class="ac-bonus"><span>1</span>第一名：2000枚代币</div>
          <div class="ac-bonus"><span>2</span>第二名：800枚代币</div>
          <div class="ac-bonus"><span>3</span>第三名：500枚代币</div>
          <div class="ac-bonus"><span>4</span>第四名：400枚代币</div>
          <div class="ac-bonus"><span>5</span>第五名：400枚代币</div>
          <div class="ac-bonus"><span>6</span>第六名：400枚代币</div>
          <div class="ac-bonus"><span>7</span>第七名：200枚代币</div>
          <div class="ac-bonus"><span>8</span>第八名：200枚代币</div>
          <div class="ac-bonus"><span>9</span>第九名：200枚代币</div>
          <div class="ac-bonus"><span>10</span>第十名：200枚代币</div>
          <div class="ac-bonus"><span>11-50</span>100枚代币</div>
        </div>-->
        <div class="qr-code"><img src="../../assets/eosforce-qrcode.png" height="114" width="114"/></div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import { Actions } from '@/constants/types.constants';

export default {
  name: 'PageHeader',
  data() {
    return {
      showWalletNew: false,
      showActivityPage:true,
    };
  },
  computed: {
    nodeInfo() {
      return this.app.currentNodeInfo || {};
    },
    nodeValue: {
      get() {
        return this.app.currentNodeValue;
      },
      set(value) {
        this.fetchNodeInfo({ node: value });
      },
    },
    ...mapState(['app']),
  },
  created() {
    const loop = () => {
      setTimeout(() => {
        this.fetchNodeInfo({ node: this.nodeValue })
          .then(() => {
            loop();
          })
          .catch(() => {
            loop();
          });
      }, 3000);
    };

    loop();
  },
  methods: {
    hideActivity(){
      this.showActivityPage=false;
    },
    showActivity(){
      this.showActivityPage=true;
    },
    ...mapActions({
      fetchNodeInfo: Actions.FETCH_NODE_INFO,
      refreshApp: Actions.REFRESH_APP,
    }),
  },
};
</script>

<style scoped>
.page-header {
  display: flex;
}

.brand {
  width: 200px;
  display: flex;
  align-items: center;
  height: 49px;
  font-size: 24px;
  padding-left: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.brand__link {
  color: inherit;
  text-decoration: none;
}

.header-navbar {
  display: flex;
  align-items: center;
  flex: 1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.refresh {
  cursor: pointer;
}

.page-activity{
  position: absolute;
  top: 0;
  bottom: 0;
  height: 560px;
  z-index: 999;
  right: 50px;
  left: 250px;
  margin: auto;
}

  .ac-head{
    width: 100%;
    height: 60px;
    line-height: 60px;
    color: #ffffff;
    /* float: right; */
    text-align: right;
    background-color: #243E61;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }
  .ac-head span{
    padding: 0 30px;
    cursor: pointer;
  }
  .ac-body{
    overflow: auto;
    height: 500px;
    background-color: #FAFBFD;
    padding-left:28px;
    padding-right:26px;
    box-shadow:4px 0px 54px rgba(3,0,0,0.14);
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
  }
  .ac-title{
    line-height:92px;
    font-size: 26px;
    color:#1F304A;
  }
  .ac-sub-title{
    line-height:33px;
    color:#5F6065;
    font-size: 16px;
  }
  .ac-item{
    color:#A8A9AC;
    line-height:33px;
  }
  .ac-bonus-body{
    margin-bottom: 50px;
  }
.ac-bonus{
  height:33px;
  line-height: 33px;
  font-size:16px;
  color:#ffffff;
  background-color: rgba(35,56,87,0.28);
  margin:5px 0;
}
.ac-bonus span{
  padding:0 13px;
}
  .ac-bonus:nth-child(1){
    width:203px;
    background-color: rgba(35,56,87,0.8);
  }
.ac-bonus:nth-child(2){
  width:263px;
  background-color: rgba(35,56,87,0.6);
  }
.ac-bonus:nth-child(3){
  width:323px;
  background-color: rgba(35,56,87,0.4);
}
.ac-bonus:nth-child(4){
  width:383px;
}
.ac-bonus:nth-child(5){
  width:383px;
}
.ac-bonus:nth-child(6){
  width:383px;
}
.ac-bonus:nth-child(7){
  width:443px;
}
.ac-bonus:nth-child(8){
  width:443px;
}
.ac-bonus:nth-child(9){
  width:443px;
}
.ac-bonus:nth-child(10){
  width:443px;
}
.ac-bonus:nth-child(11){
  width:503px;
}
  .qr-code{
    padding-top:26px;
  }
</style>
