import { Mutations, Actions, Getters } from '@/constants/types.constants';
import { getAccountInfo, transfer, getTransferRecord, vote, unfreeze, claim, getTokenList, transfer_account } from '@/services/Eos';

const initState = {
  accountName: '',
  info: {},
  bpsTable: [],
  transferRecords: {
    offset: 20,
    pos: 0,
    list: [],
    more: true
  },
  tokenList: [],
  on_load_info: true
};

const mutations = {
  // on_load_info
  [Mutations.SET_ACCOUNT_NAME](state, { accountName = '' } = {}) {
    state.accountName = accountName;
  },
  [Mutations.RESET_ACCOUNT_INFO](state) {
    state.transferRecords.list.splice(0, state.transferRecords.list.length);
    state.transferRecords.pos = 0;
    state.transferRecords.more = true;
  },
  [Mutations.SET_ACCOUNT_INFO](state, { info = {} } = {}) {
    state.info = info;
  },
  [Mutations.SET_BPS_TABLE](state, { bpsTable = [] } = {}) {
    state.bpsTable = bpsTable;
  },
  [Mutations.SET_TRANSFER_RECORDS](state, { transferRecords = {} } = {}) {
    if (transferRecords.list.length < state.transferRecords.offset) {
      state.transferRecords.more = false;
    }
    state.transferRecords.list.splice(state.transferRecords.list.length, 0, ...transferRecords.list);
    state.transferRecords = transferRecords;
  },
  [Mutations.SET_TOKEN_LIST](state, { tokenList = [] } = {}) {
    state.tokenList = tokenList;
  },
  [Mutations.START_LOAD_ACCOUNT_INFO](state, { tokenList = [] } = {}) {
    state.on_load_info = true;
  },
  [Mutations.END_LOAD_ACCOUNT_INFO](state, { tokenList = [] } = {}) {
    state.on_load_info = false;
  }
};

const actions = {
  [Actions.REFRESH_APP]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_ACCOUNT, { accountName: state.accountName });
  },
  [Actions.FETCH_ACCOUNT]({ commit, dispatch }, { accountName }) {
    commit(Mutations.RESET_ACCOUNT_INFO);
    commit(Mutations.SET_ACCOUNT_NAME, { accountName });
    dispatch(Actions.GET_ACCOUNT_INFO);
  },
  [Actions.TRANSFER]({ state, dispatch, getters }, { from, to, amount, memo, password, tokenSymbol, precision, walletId, permission }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, from, walletId).then(config => {
      return transfer(config)({ from, to, amount, memo, tokenSymbol, precision, permission });
    });
  },
  [Actions.VOTE]({ state, dispatch, getters }, { voter, bpname, amount, password, walletId, permission }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, voter, walletId).then(config => {
      return vote(config)({ voter, bpname, amount, permission });
    });
  },
  [Actions.UNFREEZE]({ state, dispatch, getters }, { voter, bpname, password, walletId, permission }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, voter, walletId).then(config => {
      return unfreeze(config)({ voter, bpname, permission });
    });
  },
  [Actions.CLAIM]({ state, dispatch, getters }, { voter, bpname, password, walletId, permission }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, voter, walletId).then(config => {
      return claim(config)({ voter, bpname, permission });
    });
  },
  [Actions.GET_ACCOUNT_INFO]({ state, dispatch, commit, getters }) {
    const accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    commit(Mutations.START_LOAD_ACCOUNT_INFO);
    return getAccountInfo(getters[Getters.CURRENT_NODE])(accountName, () => {})
      .then(({ info, bpsTable }) => {
        commit(Mutations.END_LOAD_ACCOUNT_INFO);
        commit(Mutations.SET_ACCOUNT_INFO, { info });
        commit(Mutations.SET_BPS_TABLE, { bpsTable });
      })
      .then(() => {
        return dispatch(Actions.GET_TRANSFER_RECORD, { accountName });
      })
      .then(() => {
        return dispatch(Actions.GET_TOKEN_LIST, { accountName });
      });
  },
  [Actions.GET_TRANSFER_RECORD]({ state, commit, getters }, { accountName, pos, offset }) {
    pos = pos === undefined ? state.transferRecords.pos : pos;
    offset = offset || state.transferRecords.offset;
    return getTransferRecord(getters[Getters.CURRENT_NODE])({ accountName, pos, offset }).then(result => {
      commit(Mutations.SET_TRANSFER_RECORDS, { transferRecords: { list: result.actions, pos, offset } });
    });
  },
  [Actions.GET_TOKEN_LIST]({ dispatch, commit, getters }, { accountName }) {
    return getTokenList(getters[Getters.CURRENT_NODE])(accountName).then(result => {
      commit(Mutations.SET_TOKEN_LIST, { tokenList: result });
    });
  },
  [Actions.GET_BPS_TABLE]({ state, dispatch, commit, getters }) {
    const accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    return getAccountInfo(getters[Getters.CURRENT_NODE])(accountName).then(({ bpsTable }) => {
      commit(Mutations.SET_BPS_TABLE, { bpsTable });
    });
  },

  [Actions.GET_ACCOUNT_OVERVIEW]({ state, dispatch, commit, getters }) {
    const accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    return getAccountInfo(getters[Getters.CURRENT_NODE])(accountName).then(({ info }) => {
      commit(Mutations.SET_ACCOUNT_INFO, { info });
    });
  },

  async [Actions.TRANSFER_ACCOUNT]({ state, dispatch, commit, getters }, { name, publick_key, password, walletId, permissions = ['active', 'owner'] }) {
    let config = await getters[Getters.GET_TRANSE_CONFIG](password, name, walletId);
    let res = await transfer_account(config)({ name, publick_key, permissions });
    return res;
  },
};

const getters = {
  [Getters.CURRENT_ACCOUNT_NAME](state, getters, rootState) {
    return state.accountName;
  },
};

export default {
  state: initState,
  mutations,
  actions,
  getters,
};
