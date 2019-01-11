<template>
  <div class="page-body">
    <page-menu />
    <router-view></router-view>
    <div class="dashboard-body" v-if="$route.name === 'walletDetail'">
      <div class="box overview_box">

          <!-- todo_top_info_components -->
          <div class="info_box_ct" v-if="copy_success">
              <div class="load_area_out view_info_box">
                  <div class="load_area">
                      <div>{{ $t('已复制成功') }}</div>
                  </div>
              </div>
          </div>

          <div class="publickey" style="line-height: 27px;">
            <span>{{$t('公钥')}}</span>： <el-tooltip class="item account_name_tag" effect="dark" :content='$t("点击复制")' placement="top"> <span @click="copyToClipboard(walletData.publicKey)" class="point_tag">{{ walletData.publicKey }}</span> </el-tooltip>
            <span class="is-grouped">
              <a style="margin-left:15px" class="button is-small is-outlined" @click="exportWallet()">{{$t('导出钱包')}}</a>
              <a style="margin-left:15px" class="button is-small is-outlined" @click="toggle('showDeleteWallet', true)">{{$t('删除钱包')}}</a>
            </span>

            <span class="refresh fr el-icon-refresh" :class="{spin: spin}" @click="refresh()"></span>
          </div>
          <div class="dec" style="display:flex;">
            <div style="margin-right:24px;" v-if="$i18n.locale === 'zh'">
              <p><span style="color:#f00">*特别提醒*：</span></p>
              <p>1. 本钱包只提供创建公私钥服务，您需要进一步创建用户名才能做链上操作。</p>
              <p>2. 因为创建用户名需要花费0.1个EOSC，所以请向本钱包内的其他用户，或已经拥有用户名的钱包外第三方用户，或官方客服提出创建申请。
</p>
              <p>3. 需向创建者提供您的公钥(EOS...) 和期望的用户名，切勿提供您的私钥（5...）。
</p>
              <p>4. 你还可以扫描右侧二维码加群，找客服免费创建用户名，仅限新用户，每人一个。
</p>
              <p>5. 创建交易成功后，请点击刷新，用户名会自动显示在左侧。</p>
            </div>
            <div style="margin-right:24px;" v-if="$i18n.locale === 'en'">
              <p><span style="color:#f00">*Kind Reminder*：</span></p>
              <p>1. The wallet only help generate public and private keys. You shall create a user account to enable any onchain activity.</p>
              <p>2. Create an account by submitting a request to users who already have an account at EOSForce wallet or a third-party wallet that support EOSForce. </p>
              <p>3. Provide your public key and the name you want to create to the third party. Please do not reveal your private key. </p>
              <p>4. Create an account will consume 0.1 EOS. After the registration, please click the refresh button and your account name will be displayed on the left side of the wallet. </p>
              <p>5. Telegram <a href="https://t.me/eosforce_en">https://t.me/eosforce_en</a></p>
            </div>
            <div style="margin-right:24px;" v-if="$i18n.locale === 'kr'">
              <p><span style="color:#f00">* 주의사항 *</span></p>
              <p>1.본 지갑은 Public / Private Key만 제공하므로 체인 상에서 작업을 수행하려면 사용자 계정을 만들어야 합니다.</p>
              <p> 2. 사용자 이름을 만들려면 0.1 EOSC가 필요하므로 지갑의 다른 사용자 또는 이미 계정이 있는 제3자에 요청하거나, 공식 고객 서비스 채널에 계정 개설을 요청하세요.</p>
              <p>3. 다른 사용자나 제3자에게 요청하여 계정을 만들경우, Public Key와 희망하는 계정명을 생성자에게 제공하세요. (Private Key는 누구에게도 제공해서는 안됩니다.)
</p>
              <p>4. 공식 고객 서비스 채널에 무료로 계정 개설을 요청할 수 있습니다. 공식 채널 : https://t.me/eosforcekr
</p>
              <p> 5. 개설한 이후, 새로고침을 클릭하시면 계정명이 왼쪽에 자동으로 표시됩니다.
</p>
              <p>
                지갑을 삭제하기 전, 만약 후에 이 지갑에 대해 아직 필요한 것이 있다면 지갑을 백업하였는지 확인해주세요. 백업을 거치지 않고 삭제할 경우, 계정을 복구할 수 없으며 대응 자산 또한 되찾을 수 없으니 다시 한 번 확인하시고 주의하시기 바랍니다.
              </p>
            </div>
            <div  v-if="$i18n.locale === 'zh'"><img src="@/assets/kefu.png" width="160"></div>
          </div>
          <div style="margin-top: 16px;">
            <span style="position: relative;top: 5px;">{{$t('查询用户名是否存在：')}}</span>
            <input class="input" style="width:300px;background: #fff;" :placeholder="$t('需要查询的用户名')" type="text" v-model="queryAccountName">
            <a class="button is-outlined" :disabled="queryAccountName && !isValidAccountName" @click="query">{{$t('查询')}}</a>
          </div>
          <p class="help is-danger" v-show="queryAccountName && !isValidAccountName">
            {{this.$t('用户名只能包含 .12345abcdefghijklmnopqrstuvwxyz，并且在 12 位以内')}}
          </p>
      </div>
    </div>
    <confirm-modal :title="$t('删除钱包')" :show="showDeleteWallet" @confirm="decryptAndDeleteWallet" @close="toggle('showDeleteWallet', false)">
      <div>
        <p class="help is-danger" style="font-size:14px;">{{ $t('您正在进行删除钱包操作，如对该钱包还有需要，请确保您已经导出钱包并妥善保管，一经删除您的账户将无法恢复，对应资产将无法找回，请谨慎操作。') }}</p>
        <div class="row" style="margin-top:16px;">
          <div class="row__title">{{$t('钱包密码')}}</div>
          <div class="row__content">
            <input class="input" v-model="password" type="password" :placeholder="$t('请输入钱包密码')" required />
          </div>
        </div>
      </div>
    </confirm-modal>
    <router-view name="modal"></router-view>
  </div>
</template>

<script>
import PageMenu from '@/views/layout/PageMenu';
import { mapGetters, mapActions, mapState } from 'vuex';
import { isValidAccountName } from '@/utils/rules';

import ConfirmModal from '@/components/ConfirmModal';
import Message from '@/components/Message';
import { Getters, Actions } from '@/constants/types.constants';
import { decryptWif } from '@/utils/util';
import { queryAccount } from '@/services/Eos';
import Copy from 'clipboard-copy'

export default {
  name: 'WalletDetail',
  data() {
    return {
      password: '',
      showDeleteWallet: false,
      queryAccountName: '',
      spin: false,
      copy_success: false
    };
  },
  computed: {
    ...mapGetters({
      accountList: Getters.ACCOUNT_LIST,
    }),
    isValidAccountName() {
      return this.queryAccountName && isValidAccountName(this.queryAccountName);
    },
    walletData() {
      return this.wallet.data || {};
    },
    ...mapState(['account', 'wallet', 'app']),
  },
  methods: {
    initWallet(id) {
      this.fetchWallet({ id: id || this.$route.params.walletId }).catch(err => {
        Message.error(`${this.$t('账户列表加载失败')}： ${err && err.message}`);
        return Promise.reject(err);
      });
    },
    copyToClipboard(text) {
        Copy(text);
        this.copy_success = true;
        setTimeout(() => {
            this.copy_success = false;
        }, 500);
    },
    query() {
      if (!isValidAccountName) return;
      return queryAccount(this.app.currentNodeValue)(this.queryAccountName).then(result => {
        if (result) {
          Message.success(`「${this.queryAccountName}」${this.$t('已存在')}`);
        } else {
          Message.error(`「${this.queryAccountName}」${this.$t('不存在')}`);
        }
        this.queryAccountName = '';
      });
    },
    refresh() {
      if (this.spin) return;
      this.spin = true;
      this.refreshWallet()
        .then(data => {
          this.spin = false;
        })
        .catch(() => {
          this.spin = false;
        });
    },
    toggle(key, val) {
      return (this[key] = val === undefined ? !this[key] : val);
    },
    // 删除钱包
    decryptAndDeleteWallet() {
      return decryptWif(this.password, this.walletData.crypto)
        .catch(err => {
          Message.error(err && err.message);
          return Promise.reject(err);
        })
        .then(data => {
          return this.deleteWallet({ publicKey: this.walletData.publicKey });
        })
        .then(result => {
          this.toggle('showDeleteWallet', false);
          location.reload();
          Message.success(this.$t('删除成功'));
        });
    },
    // 导出钱包存储文件
    exportWallet() {
      this.fetchWallet({ id: this.$route.params.walletId, mutation: false }).then(data => {
        const filename = `UTC--${new Date().toISOString()}--${data.publicKey}`;
        const file = new File([JSON.stringify(data)], filename, { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = filename;
        a.click();
      });
    },
    ...mapActions({
      fetchWallet: Actions.FETCH_WALLET,
      refreshWallet: Actions.REFRESH_WALLET,
      deleteWallet: Actions.DELETE_WALLET,
    }),
  },
  beforeRouteUpdate(to, from, next) {
    if (to.params.walletId !== from.params.walletId) {
      this.initWallet(to.params.walletId);
    }
    next();
  },
  created() {
    if (this.$router.currentRoute.name !== 'accountDetail') {
      this.initWallet();
    }
  },
  components: {
    PageMenu,
    ConfirmModal,
  },
};
</script>

<style scoped>
.info_box_ct {
    position: absolute;
    height: 0px;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 1;
    width: 100%;
    left: 0px;
    top: 0px;
}

.info_box_ct .load_area_out {
    top: 0px;
    animation: info_box_top_end 0.05s linear;
}

.overview_box {
    position: relative;
}

.point_tag{
  cursor: pointer;
}

.dashboard-body {
  padding: 24px;
  overflow: auto;
  flex: 1;
}

.refresh {
  line-height: 27px;
  cursor: pointer;
  font-size: 20px;
}

.refresh.spin {
  animation: spin 1s linear infinite;
}

.dec {
  margin-top: 20px;
  font-size: 14px;
}
</style>

