import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletKeyFromId } from '@/services/Storage';
import { newAccount, getAccounts } from '@/services/Eos';
import { decrypt } from '@/utils/util';

const initState = {
  data: {},
  /*
    eos lib, there are two eos lib , one has fee, the other has no fee
  */
  EOS_WITH_FEE: false,
  wallet_symbol: 'EOS',
  WALLET_SHOW_SYMBOL: 'EOSC',
  IS_FEE_MODEL: false,
  // has cpu mortgage
  HAS_CPU: true,
  // has net mortgage
  HAS_NET: true,
  // minus vote of ram will be locked  status
  RAM_BACK_STATE: false,
  // minus vote will be locked status
  VOTE_BACK_STATE: false,
  // share released coin from block producers
  HAS_CLAIM: false,
  // must freezed then can vote for ram and vote
  HAS_FREEZED: true,
  // core coin in which contract account
  CORE_COIN_CONTRACT: 'eosio.token',
  // vote num in which key [vote, staked]
  VOTE_NUM_KEY: 'vote',
  // has blocked
  HAS_LOCKED: false,


  // EOS_WITH_FEE: true,
  // eosforce config
  // wallet_symbol: 'EOS',
  wallet_show_symbol: 'EOSC',
  IS_FEE_MODEL: true,
  HAS_CPU: false,
  HAS_NET: false,
  // // 内存投票是否有赎回状态
  RAM_BACK_STATE: true,
  // // 投票是否有赎回状态
  VOTE_BACK_STATE: true,
  // // 是否有分红
  HAS_CLAIM: true,
  // // 有抵押机制
  HAS_FREEZED: false,
  // core coin in which contract account
  CORE_COIN_CONTRACT: 'eosio',
  VOTE_NUM_KEY: 'staked',
  HAS_LOCKED: true,

  accountList: [],
};

const mutations = {
  [Mutations.SET_WALLET](state, { data }) {
    state.data = data;
  },
  [Mutations.SET_ACCOUNT_LIST](state, { accountList }) {
    state.accountList = accountList;
  }
};

const actions = {
  [Actions.REFRESH_APP]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_WALLET, { id: state.data.publicKey });
  },
  [Actions.REFRESH_WALLET]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_WALLET_LIST, { id: state.data.publicKey });
  },
  [Actions.FETCH_WALLET]({ commit, dispatch }, { id, mutation = true }) {
    return Storage.setPath(getWalletKeyFromId(id))
      .fetch()
      .then(data => {
        if (!mutation) return data;
        commit(Mutations.SET_WALLET, { data });
      });
  },
  [Actions.FETCH_ACCOUNT_LIST]({ getters, commit }, { publicKey, noset = false } = {}) {    
    return getAccounts(getters[Getters.CURRENT_NODE])(publicKey).then(result => {
      if (noset) return result;
      commit(Mutations.SET_ACCOUNT_LIST, { accountList: result });
    });
  },
  [Actions.NEW_ACCOUNT]({ state, getters, dispatch }, { creator, OwnerKey, ActiveKey, accountName, password, walletId, permission }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, creator, walletId).then(config => {
      return newAccount(config)({creator, OwnerKey, ActiveKey, accountName, permission, wallet_symbol: state.wallet_symbol});
    });
  }
};

const getters = {
  [Getters.ACCOUNT_LIST](state) {
    return state.accountList || [];
  },
  [Getters.GET_WIF]: state => password => {
    try {
      const wif = decrypt(password, state.data.crypto).privateKey;
      return Promise.resolve(wif);
    } catch (err) {
      return Promise.reject(new Error('密码错误'));
    }
  },
  wallet_symbol (state) {
    return state.wallet_symbol;
  },
  CORE_COIN_CONTRACT (state) {
    return state.CORE_COIN_CONTRACT;
  },
  VOTE_NUM_KEY (state) {
    return state.VOTE_NUM_KEY;
  },
  HAS_FREEZED (state) {
    return state.HAS_FREEZED;
  },
  HAS_LOCKED (state) {
    return state.HAS_LOCKED;
  }
};

export default {
  state: initState,
  mutations,
  actions,
  getters,
};
