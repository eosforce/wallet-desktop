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
  wallet_symbol: 'EOST',
  WALLET_SHOW_SYMBOL: 'EOST',
  IS_FEE_MODEL: false,
  // has cpu mortgage
  has_cpu: true,
  // has net mortgage
  has_net: true,
  // minus vote of ram will be locked  status
  ram_back_state: false,
  // minus vote will be locked status
  vote_back_state: false,
  // share released coin from block producers
  has_claim: false,
  // must freezed then can vote for ram and vote
  has_freezed: true,
  // core coin in which contract account
  CORE_COIN_CONTRACT: 'eosio.token',
  // vote num in which key [vote, staked]
  vote_num_key: 'vote',
  // has blocked
  has_locked: false,


  // EOS_WITH_FEE: true,
  // eosforce config
  // wallet_symbol: 'EOS',
  // wallet_show_symbol: 'EOSC',
  // IS_FEE_MODEL: true,
  // has_cpu: false,
  // has_net: false,
  // // 内存投票是否有赎回状态
  // ram_back_state: true,
  // // 投票是否有赎回状态
  // vote_back_state: true,
  // // 是否有分红
  // has_claim: true,
  // // 有抵押机制
  // has_freezed: false,
  // core coin in which contract account
  // CORE_COIN_CONTRACT: 'eosio',
  // vote_num_key: 'staked',
  // has_locked: true,

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
  vote_num_key (state) {
    return state.vote_num_key;
  },
  has_freezed (state) {
    return state.has_freezed;
  },
  has_locked (state) {
    return state.has_locked;
  }
};

export default {
  state: initState,
  mutations,
  actions,
  getters,
};
