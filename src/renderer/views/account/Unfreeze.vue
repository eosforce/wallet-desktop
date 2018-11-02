<template>
  <confirm-modal :showConfirm="remainHeight <= 0" :show="true" :submitting="submitting" @confirm="submit()" @close="close">
    <div>
      <div class="graphic">
        <div class="graphic-item">
          <img src="@/assets/vote/redeem.png">
          <label>{{$t('赎回金额')}}</label>
        </div>
        <div class="graphic-item">
          <img style="width: 50px;margin-left:50px;margin-right:50px;" src="@/assets/vote/transform.png">
          <label></label>
        </div>
        <div class="graphic-item">
          <img src="@/assets/vote/avaliable.png">
          <label>{{$t('可用余额')}}</label>
        </div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('交易名称')}}</div>
        <div class="row__content">{{$t('赎回')}}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('超级节点名称')}}</div>
        <div class="row__content">{{bpname}}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('投票人用户')}}</div>
        <div class="row__content">{{voter}}</div>
      </div>
      <div class="row">
        <div class="row__title" :class="{red: remainHeight > 0}">{{$t('锁定三天，解锁块高度')}}</div>
        <div class="row__content" :class="{red: remainHeight > 0}">{{unstakeHeight + 86400}}</div>
      </div>
      <div class="row">
        <div class="row__title" :class="{red: remainHeight > 0}">{{$t('可赎回时间')}}</div>
        <div class="row__content" :class="{red: remainHeight > 0}">{{lockTime}}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('可赎回金额')}}</div>
        <div class="row__content">{{ symblo_change( unstakingAmount ) | formatNumber({p: 4, showSymbol: true})  }}</div>
      </div>
      <div class="row">
        <div class="row__title">{{$t('手续费')}}</div>
        <div class="row__content">{{ symblo_change(app.fee) }}</div>
      </div>
      <div class="row" v-if="remainHeight <= 0">
        <div class="row__title">{{$t('输入密码')}}</div>
        <div class="row__content">
          <input class="input" v-model="password" type="password" :placeholder="$t('请输入投票人的钱包密码')" required />
        </div>
      </div>
    </div>
  </confirm-modal>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Message from '@/components/Message';
import ConfirmModal from '@/components/ConfirmModal';
import { Actions } from '@/constants/types.constants';
import {
  symblo_change
} from '@/utils/util.js'
import dayjs from 'dayjs';

export default {
  name: 'unfreeze',
  data() {
    return {
      password: '',
      submitting: false,
      date: null,
    };
  },
  computed: {
    lockTime() {
      return dayjs(this.date + this.remainHeight * 3000).format('YYYY-MM-DD HH:mm:ss');
    },
    voter() {
      return this.$route.params.accountName;
    },
    bpname() {
      return this.$route.params.bpname;
    },
    unstakingAmount() {
      const bp = this.account.bpsTable && this.account.bpsTable.find(bp => this.bpname === bp.name);
      if (bp) {
        if (bp.vote) {
          return bp.vote.unstaking;
        } else {
          return '0 EOS';
        }
      } else {
        return null;
      }
    },
    unstakeHeight() {
      const bp = this.account.bpsTable && this.account.bpsTable.find(bp => this.bpname === bp.name);
      if (bp) {
        if (bp.vote) {
          return bp.vote.unstake_height;
        } else {
          return null;
        }
      } else {
        return null;
      }
    },
    baseInfo() {
      return this.account.info.baseInfo || {permissions: []};
    },
    permissions () {
      let res = [];
      this.baseInfo.permissions.map(item => {
        let is_have = item.required_auth.keys.find(item => {
          if(item.key == this.wallet.data.publicKey){
            return true;
          }
        });
        is_have = is_have ? true : false;
        res.push({
          name: item.perm_name,
          is_have
        })
      });
      return res;
    },
    has_owner () {
      return this.permissions.find(item => {
        if(item.name == 'owner' && item.is_have){
          return true;
        }
      })
    },
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  methods: {
    submit() {
      if (this.remainHeight > 0) {
        this.close();
        return;
      }
      this.submitting = true;
      this.unfreeze({
        bpname: this.bpname,
        voter: this.voter,
        password: this.password,
        walletId: this.walletData.publicKey,
        permission: this.permissions.filter(item => item.is_have)[0].name
      })
        .then(result => {
          Message.success(this.$t('赎回成功'));
        })
        .catch(err => {
          Message.error({
            title: `${err.code ? `code: ${err.code}` : this.$t('赎回失败')}`,
            message: err.message,
          });
          this.submitting = false;
          return Promise.reject(err);
        })
        .then(result => {
          this.getAccountInfo({ accountName: this.voter });
          this.close();
        });
    },
    close() {
      this.$router.push({ name: 'accountDetail' });
    },
    symblo_change,
    ...mapActions({
      getAccountInfo: Actions.GET_ACCOUNT_INFO,
      unfreeze: Actions.UNFREEZE,
    }),
  },
  created() {
    this.remainHeight = this.unstakeHeight + 86400 - this.app.currentNodeInfo.head_block_num;
    this.date = +new Date();
  },
  components: {
    ConfirmModal,
  },
};
</script>

<style>
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
  width: 60px;
}
.red {
  color: #ff3d00;
}
</style>

