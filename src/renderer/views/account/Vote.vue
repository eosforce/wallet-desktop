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
              当前投票金额<span class="static-text">{{stakedAmount | number(0) | intPartFormat(0)}}</span>
            </div>
          </div>
          <div class="field">
            <div class="static-label">
              可用投票金额<span class="static-text">{{account.info.available | number | NumFormat}}</span>
            </div>
          </div>
          <div class="field">
            <label class="label">
              新投票金额（整数）
            </label>
            <div class="control">
              <input v-model="amount" min="0" class="input" type="number" step="1" placeholder="单位 EOS"  required />
              <p class="help is-danger" v-show="amount && !isValidAmount">
                金额必须为整数
              </p>
            </div>
          </div>
          <div class="field">
            <p class="help tips">* 手续费 {{app.fee}}</p>
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
          <div class="row__title">新投票金额</div>
          <div class="row__content">{{amount | asset}}</div>
        </div>
        <div class="row">
          <div class="row__title">手续费</div>
          <div class="row__content">{{app.fee}}</div>
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
import { asset, number, NumFormat, intPartFormat } from '@/utils/filter';

export default {
  name: 'vote',
  data() {
    return {
      amount: '',
      password: '',

      showConfirm: false,
      submitting: false,
    };
  },
  computed: {
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
  created() {
    this.amount = parseInt(this.stakedAmount);
  },
  methods: {
    confirmInfo() {
      if (this.isValidAmount) {
        this.showConfirm = true;
      }
    },
    submit() {
      this.submitting = true;
      this.vote({
        amount: this.amount,
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
  filters: {
    asset,
    number,
    NumFormat,
    intPartFormat,
  },
  components: {
    ConfirmModal,
  },
};
</script>
