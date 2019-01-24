import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletKeyFromId } from '@/services/Storage';
import { newAccount, getAccounts } from '@/services/Eos';
import { decrypt } from '@/utils/util';

const initState = {
  data: {},
  wallet_symbol: 'EOSC',
  is_fee_model: false,
  FILTER_WAY: 'EOS',
  has_cpu: true,
  has_net: true,
  // 内存投票是否有赎回状态
  ram_back_state: false,
  // 投票是否有赎回状态
  vote_back_state: false,
  // 是否有分红
  has_claim: false,
  // 有抵押机制
  has_freezed: true,
  // 可用余额提取方式
  avalaible_filter: 'eosio.token',
  // vote num in which key
  vote_num_key: 'vote',


  wallet_symbol: 'EOS',
  is_fee_model: true,
  FILTER_WAY: 'EOS',
  has_cpu: false,
  has_net: false,
  // 内存投票是否有赎回状态
  ram_back_state: true,
  // 投票是否有赎回状态
  vote_back_state: true,
  // 是否有分红
  has_claim: true,
  // 有抵押机制
  has_freezed: false,
  // 可用余额提取方式
  avalaible_filter: 'eosio',
  vote_num_key: 'staked',

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
  GET_FILER_WAY (state) {
    return state.FILTER_WAY;
  },
  wallet_symbol (state) {
    return state.wallet_symbol;
  },
  avalaible_filter (state) {
    return state.avalaible_filter;
  },
  vote_num_key (state) {
    return state.vote_num_key;
  },
  has_freezed (state) {
    return state.has_freezed;
  }
};

export default {
  state: initState,
  mutations,
  actions,
  getters,
};
