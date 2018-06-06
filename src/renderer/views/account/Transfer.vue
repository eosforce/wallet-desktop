<template>
  <div class="modal is-active">
    <div class="cover-page">
      <div class="cover-page__content">
        <div class="cover-page__title">转账</div>
        <form class="cover-page__form" @submit.prevent="confirmInfo()">
          <div class="field">
            <label class="label">
              收款用户
            </label>
            <div class="control">
              <input v-model="toAccountName" class="input" type="text" placeholder="请输入收款用户名" required />
              <p class="help is-danger" v-show="toAccountName && !isValidToAccountName">
                用户名只能包含 .12345abcdefghijklmnopqrstuvwxy，并且在 12 位以内
              </p>
            </div>
          </div>
          <div class="field">
            <label class="label">
              转账金额
            </label>
            <div class="control">
              <input v-model="amount" min="0" class="input" type="number" step="0.0001" placeholder="单位 EOS" required />
              <p class="help is-danger" v-show="amount && !isValidAmount">
                金额必须为数字，且最多 4 位小数
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
      <a class="modal-close is-large cover-page-close" @click="close"></a>
    </div>
    <confirm-modal :show="showConfirm" :submitting="submitting" @confirm="submit()" @close="toggle('showConfirm', false)">
      <div>
        <div class="row">
          <div class="row__title">交易名称</div>
          <div class="row__content">转账</div>
        </div>
        <div class="row">
          <div class="row__title">转出用户</div>
          <div class="row__content">{{fromAccountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">收款用户</div>
          <div class="row__content">{{toAccountName}}</div>
        </div>
        <div class="row">
          <div class="row__title">转账金额</div>
          <div class="row__content">{{amount | asset}}</div>
        </div>
        <div class="row">
          <div class="row__title">手续费</div>
          <div class="row__content">{{app.fee}}</div>
        </div>
        <div class="row">
          <div class="row__title">输入密码</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" placeholder="请输入转出用户的钱包密码" required />
          </div>
        </div>
      </div>
    </confirm-modal>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

import Message from '@/components/Message'
import ConfirmModal from '@/components/ConfirmModal'
import { Actions, Getters } from '@/constants/types.constants'
import { randomKey, privateToPublic } from '@/utils/util'
import { isValidAccountName, isValidAmount } from '@/utils/rules'
import { asset } from '@/utils/filter'

export default {
  name: 'AccountNew',
  data() {
    return {
      toAccountName: '',
      amount: '',
      submitting: false,

      password: '',
      showConfirm: false,
    }
  },
  computed: {
    fromAccountName() {
      return this.$route.params.accountName
    },
    isValidToAccountName() {
      return this.toAccountName && isValidAccountName(this.toAccountName)
    },
    isValidAmount() {
      return this.amount && isValidAmount(this.amount)
    },
    ...mapState(['app']),
  },
  methods: {
    confirmInfo() {
      if (this.isValidToAccountName && this.isValidAmount) {
        this.showConfirm = true
      }
    },
    submit() {
      this.submitting = true
      this.transfer({
        from: this.fromAccountName,
        to: this.toAccountName,
        amount: this.amount,
        password: this.password,
      })
        .then(result => {
          Message.success('转账成功')
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : '转账失败'}`,
            message: err.message,
          })
          this.submitting = false
          return Promise.reject(err)
        })
        .then(() => {
          this.getAccountInfo()
          this.close()
        })
    },
    close() {
      this.$router.push({ name: 'accountDetail' })
    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val)
    },
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      transfer: Actions.TRANSFER,
    }),
  },
  filters: {
    asset,
  },
  components: {
    ConfirmModal,
  },
}
</script>
