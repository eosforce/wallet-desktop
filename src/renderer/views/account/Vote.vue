<template>
  <div class="modal is-active">
    <div class="cover-page">
      <div class="cover-page__content">
        <div class="cover-page__title">超级节点投票</div>
        <form class="cover-page__form" @submit.prevent="confirmInfo">
          <div class="field">
            <div class="static-label">
              超级节点名称<span class="static-text">{{bpname}}</span>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              当前投票金额<span class="static-text">{{stakedAmount | formatNumber({p: 0, showSymbol: true})}}</span>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              可用投票金额<span class="static-text">{{account.info.available | formatNumber({p: 4, showSymbol: true})}}</span>
            </div>
          </div>
          <div class="field is-horizontal">
            <label class="label">
              投票类型
            </label>
            <div class="control" style="margin-left:16px;color:#fff;">
              <label class="radio">
                <input type="radio" v-model="selectType" value="0" :disabled="selectMap['0'].disabled">
                新增投票
              </label>
              <label class="radio">
                <input type="radio" v-model="selectType" value="1" :disabled="selectMap['1'].disabled">
                赎回投票
              </label>
              <p class="help is-danger" v-show="amount && !isValidAmount">
                金额必须为整数
              </p>
            </div>
          </div>
          <div class="field">
            <label class="label">
              {{selectInfo.title}}
            </label>
            <div class="control">
              <input v-model="amount" min="0" :max="selectInfo.max" class="input" type="number" step="1" placeholder="单位 EOS"  required />
              <p class="help is-danger" v-show="amount && !isValidAmount">
                金额必须为整数
              </p>
              <p class="help tips">{{selectInfo.tip}}，手续费 {{fee}} EOS</p>
              <p class="help is-danger" v-show="amount > selectInfo.max">
                {{selectInfo.maxTip}}
              </p>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              修改后投票金额<span class="static-text">{{newStakedAmount | formatNumber({p: 0, showSymbol: true})}}</span>
            </div>
          </div>
          <div class="field is-grouped is-grouped-right">
            <div class="control">
              <a tabindex="-1" class="button cancel-button" @click="close">取消</a>
            </div>
            <div class="control">
              <button type="submit" class="button is-link">下一步</button>
            </div>
          </div>
        </form>
      </div>
      <a class="modal-close cover-page-close" @click="close"></a>
    </div>
    <confirm-modal :show="showConfirm" :submitting="submitting" @confirm="submit()" @close="toggle('showConfirm', false)">
      <div>
        <div class="graphic">
          <div class="graphic-item" :style="{order: this.selectType === '0' ? 1 : 3}">
            <img src="@/assets/vote/avaliable.png">
            <label>可用余额</label>
          </div>
          <div class="graphic-item" style="order:2">
            <img style="width: 50px;margin-left:50px;margin-right:50px;" src="@/assets/vote/transform.png">
            <label></label>
          </div>
          <div class="graphic-item" :style="{order: this.selectType === '0' ? 3 : 1}">
            <img src="@/assets/vote/vote.png">
            <label>投票金额</label>
          </div>
        </div>
        <div>
          <p>投票成功后EOS将进入投票账户,撤销投票后约3天可赎回到余额账户</p>
        </div>
        <div class="row">
          <div class="row__title">交易名称</div>
          <div class="row__content">超级节点投票</div>
        </div>
        <div class="row">
          <div class="row__title">超级节点</div>
          <div class="row__content">{{bpname}}</div>
        </div>
        <div class="row">
          <div class="row__title">投票人用户</div>
          <div class="row__content">{{voter}}</div>
        </div>
        <div class="row">
          <div class="row__title">{{selectInfo.confirm}}</div>
          <div class="row__content">{{amount | formatNumber({p: 0, showSymbol: true})}}</div>
        </div>
        <div class="row">
          <div class="row__title">修改后投票金额</div>
          <div class="row__content">{{newStakedAmount | formatNumber({p: 0, showSymbol: true})}}</div>
        </div>
        <div class="row">
          <div class="row__title">手续费</div>
          <div class="row__content">{{fee}} EOS</div>
        </div>
        <div class="row">
          <div class="row__title">输入密码</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" placeholder="请输入投票人的钱包密码" required />
          </div>
        </div>
      </div>
    </confirm-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import { Actions } from '@/constants/types.constants';
import { isValidAmount } from '@/utils/rules';
import { toNumber } from '@/utils/util';

export default {
  name: 'vote',
  data() {
    return {
      amount: '',
      password: '',

      showConfirm: false,
      submitting: false,
      fee: 0.05,
      selectType: '0',
    };
  },
  computed: {
    selectMap() {
      return {
        '0': {
          title: '新增金额（整数）',
          confirm: '新增金额',
          tip: '* 立即生效',
          max: toNumber(this.account.info.available) - this.fee,
          maxTip: '超过可用投票金额！',
          disabled: false,
        },
        '1': {
          title: '赎回金额（整数）',
          confirm: '赎回金额',
          tip: '* 赎回锁定期三天，三天后需手动解锁',
          max: toNumber(this.stakedAmount),
          maxTip: '超过当前投票金额！',
          disabled: toNumber(this.stakedAmount) <= 0,
        },
      };
    },
    newStakedAmount() {
      if (this.selectType === '0') {
        return toNumber(this.stakedAmount) + toNumber(this.amount);
      } else if (this.selectType === '1') {
        return toNumber(this.stakedAmount) - toNumber(this.amount);
      } else {
        return undefined;
      }
    },
    selectInfo() {
      return this.selectMap[this.selectType];
    },
    voter() {
      return this.$route.params.accountName;
    },
    bpname() {
      return this.$route.params.bpname;
    },
    stakedAmount() {
      const bp = this.account.bpsTable && this.account.bpsTable.find(bp => this.bpname === bp.name);
      if (bp) {
        if (bp.vote) {
          return bp.vote.staked;
        } else {
          return '0 EOS';
        }
      } else {
        return null;
      }
    },
    isValidAmount() {
      return this.amount && isValidAmount(this.amount);
    },
    ...mapState(['app', 'account']),
  },
  methods: {
    confirmInfo() {
      if (this.isValidAmount && this.newStakedAmount !== undefined) {
        this.showConfirm = true;
      }
    },
    submit() {
      this.submitting = true;
      this.vote({
        amount: this.newStakedAmount,
        bpname: this.bpname,
        password: this.password,
        voter: this.voter,
      })
        .then(result => {
          Message.success('投票成功');
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : '投票失败'}`,
            message: err.message,
          });
          this.submitting = false;
          return Promise.reject(err);
        })
        .then(() => {
          this.getAccountInfo({ accountName: this.voter });
          this.close();
        });
    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val);
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      vote: Actions.VOTE,
    }),
  },
  components: {
    ConfirmModal,
  },
};
</script>

<style>
.radio:hover {
  color: #fff;
}
.graphic {
  margin-bottom: 32px;
  display: flex;
  justify-content: center;
}
.graphic-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.graphic img {
  width: 100px;
}
</style>
