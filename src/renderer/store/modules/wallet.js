import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletKeyFromId } from '@/services/Storage';
import { newAccount, getAccounts } from '@/services/Eos';
import { decrypt } from '@/utils/util';

const initState = {
  data: {},
  wallet_symbol: 'EOS',
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
      return newAccount(config)({creator, OwnerKey, ActiveKey, accountName, permission});
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
};

export default {
  state: initState,
  mutations,
  actions,
  getters,
};
