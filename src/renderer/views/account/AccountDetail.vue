<template>
    <div class="dashboard-body">
        <account-overview />
        <div class="tabs_ct">
            <div class="tabs">
                <div class="tab fl" :class="{'is-active': currentTab === tab.tabKey}" v-for="tab in tabMap" :key="tab.tabKey">
                    <a class="min-img" v-if="!tab.is_url" @click="toggleTab(tab.tabKey)"> 
                        {{tab.tabName}}<span v-show="tab.tabKey === 'BpList'">{{$t('template.version', {version: version})}}</span>
                    </a>
                    <a class="min-img" v-if="tab.is_url" v-bind:href="tab.url" target="_blank"> 
                        {{tab.tabName}}<span v-show="tab.tabKey === 'BpList'">{{$t('template.version', {version: version})}}</span>
                    </a>
                </div>
                <span class="refresh fr el-icon-refresh" :class="{spin: spin}" @click="refreshList()"></span>
            </div>
            <div :is="currentTab" ref="cTab" keep-alive></div>
            <router-view name="modal"></router-view>
        </div>
    </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
import { Actions } from '@/constants/types.constants';
import AccountOverview from '@/views/account/AccountOverview';
import TransferRecord from '@/views/account/TransferRecord';
import BpList from '@/views/account/BpList';
import Vote4ramList from '@/views/account/Vote4ramList'
import Myvote from '@/views/account/Myvote';
import AlternateNode from '@/views/account/AlternateNode';
import RateInstructions from '@/views/account/RateInstructions';
import TokenList from '@/views/account/TokenList';

export default {
    name: 'AccountDetail',
    data() {
        return {
            tabMap: [
                { tabName: this.$t('超级节点'), tabKey: 'BpList', img1: 'node.png', img2: 'node_w.png' },
                { tabName: this.$t('我的投票'), tabKey: 'Myvote', img1: 'vote.png', img2: 'vote_w.png' },
                { tabName: this.$t('内存租赁'), tabKey: 'Vote4ramList', img1: 'vote.png', img2: 'vote_w.png' },
                { tabName: this.$t('我的 Token'), tabKey: 'TokenList', img1: 'token.png', img2: 'token_w.png' },
                { tabName: this.$t('交易记录'), tabKey: 'TransferRecord', img1: 'exchange.png', img2: 'exchange_w.png' },
                { tabName: this.$t('资产说明'), tabKey: 'RateInstructions', img1: 'assets.png', img2: 'assets_w.png' },
                { tabName: this.$t('原力生态'), tabKey: '_', img1: 'assets.png', img2: 'assets_w.png', is_url: true, url: 'https://eosforce.io//?lang=cn' },
            ],
            tab_name_keys: ['超级节点', '我的投票', '内存租赁','我的 Token', '交易记录', '资产说明', '原力生态'],
            super_name: this.$t('超级节点'),
            spin: false,
            currentTab: 'BpList', // currentTab 用于标识当前触发的子组件,
        };
    },
    computed: {
        version() {
            return this.account.version;
        },
        local() {
            return localStorage.locale;
        },
        first_bp() {
            return this.account.bpsTable[0];
        },
        accountName() {
            return this.$route.params.accountName;
        },
        walletData() {
            return this.wallet.data || {};
        },
        ...mapState(['wallet', 'account']),
    },
    watch: {
        '$i18n.locale' (curr, pre) {
            this.tabMap.forEach((item, index) => {
                item.tabName = this.$t(this.tab_name_keys[index]);
            });
        }
    },
    methods: {
        initAccount() {
            return this.initApp().then(() => {
                this.fetchAccout({ accountName: this.accountName });
            });
        },
        ...mapActions({
            fetchAccout: Actions.FETCH_ACCOUNT,
            fetchWallet: Actions.FETCH_WALLET,
            initApp: Actions.INIT_APP,
            refreshTransferrecord: Actions.GET_TRANSFER_RECORD,
            refreshBpsList: Actions.GET_BPS_TABLE,
            getTokenList: Actions.GET_TOKEN_LIST,
            getBpNick: Actions.GET_BP_NICK,
        }),
        toggleTab: function(tab) {
            this.currentTab = tab; // tab 为当前触发标签页的组件名
        },
        refreshList: async function() {
            if (this.spin) return;
            this.spin = true;
            try {
                if (this.currentTab === 'TokenList') {
                    await this.getTokenList({ accountName: this.accountName });
                } else {
                    await this.refreshTransferrecord({ accountName: this.accountName, pos: -1, from_top: true });
                    // await this.refreshBpsList();
                }
                this.spin = false;
            } catch (err) {
                this.spin = false;
            }
        },
    },
    beforeRouteUpdate(to, from, next) {
        if (to.params.accountName !== from.params.accountName) {
            this.initAccount();
        }
        next();
    },
    created() {
        this.getBpNick();
        if (this.walletData.publicKey) {
            return this.initAccount();
        } else {
            this.fetchWallet({ id: this.$route.params.walletId }).then(() => {
                return this.initAccount();
            });
        }
    },
    components: {
        AccountOverview,
        TransferRecord,
        BpList,
        Myvote,
        AlternateNode,
        RateInstructions,
        TokenList,
        Vote4ramList
    },
};
</script>
<style scoped>
.dashboard-body {
    padding: 24px;
    overflow: auto;
    background: #ebeff2;
    flex: 1;
}

.tabs_ct {
    margin-top: 30px;
    border-radius: 6px;
    box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
    background: #fff;
}

.tabs_ct .tabs {
    margin-bottom: 0px;
    display: flex;
    justify-content: left;
    align-items: center;
    margin-left: 20px;
    margin-right: 20px;
    border-bottom: 1px solid #E5E5E5;
    position: relative;
}

.tabs_ct .tabs .tab {
    height: 60px;
    display: flex;
    margin-right: 40px;
    border: 0px;
    border-bottom: 1px solid #333 !important;
    font-weight: 500;
}

.tabs_ct .tabs .tab a {
    padding: 0px;
    color: #3D3E40;
}

.tabs_ct .tab a {
    border-top: 2px solid #fff;
    border-bottom: 2px solid #fff;
}

.tabs_ct .tab.is-active a,
.tabs_ct .tab:hover a {
    color: #4B7DDD;
    font-weight: 500;
    border-bottom: 2px solid #4B7DDD !important;
}

.tabs_ct .box {
    box-shadow: none;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
}

.refresh {
    cursor: pointer;
    line-height: 27px;
    text-align: left;
    height: 27px;
    font-size: 14px;
    position: absolute;
    right: 0px;
    top: 19px;
}

.refresh.spin {
    animation: spin 1s linear infinite;
}

.refresh img {
    width: 15px;
    margin: 12px 20px;
}
</style>