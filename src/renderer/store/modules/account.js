import { Mutations, Actions, Getters } from '@/constants/types.constants';
import { getAccountInfo, transfer, getTransferRecord, vote, unfreeze, claim, getTokenList } from '@/services/Eos';

const initState = {
  accountName: '',
  info: {},
  bpsTable: [],
  transferRecords: {
    offset: 20,
    pos: 0,
    list: [],
  },
  tokenList: [],
};

const mutations = {
  [Mutations.SET_ACCOUNT_NAME](state, { accountName = '' } = {}) {
    state.accountName = accountName;
  },
  [Mutations.SET_ACCOUNT_INFO](state, { info = {} } = {}) {
    state.info = info;
  },
  [Mutations.SET_BPS_TABLE](state, { bpsTable = [] } = {}) {
    state.bpsTable = bpsTable;
  },
  [Mutations.SET_TRANSFER_RECORDS](state, { transferRecords = {} } = {}) {
    state.transferRecords = transferRecords;
  },
  [Mutations.SET_TOKEN_LIST](state, { tokenList = [] } = {}) {
    state.tokenList = tokenList;
  },
};

const actions = {
  [Actions.REFRESH_APP]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_ACCOUNT, { accountName: state.accountName });
  },
  [Actions.FETCH_ACCOUNT]({ commit, dispatch }, { accountName }) {
    commit(Mutations.SET_ACCOUNT_NAME, { accountName });
    dispatch(Actions.GET_ACCOUNT_INFO);
  },
  [Actions.TRANSFER]({ state, dispatch, getters }, { from, to, amount, memo, password, tokenSymbol, precision }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, from).then(config => {
      return transfer(config)({ from, to, amount, memo, tokenSymbol, precision });
    });
  },
  [Actions.VOTE]({ state, dispatch, getters }, { voter, bpname, amount, password }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, voter).then(config => {
      return vote(config)({ voter, bpname, amount });
    });
  },
  [Actions.UNFREEZE]({ state, dispatch, getters }, { voter, bpname, password }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, voter).then(config => {
      return unfreeze(config)({ voter, bpname });
    });
  },
  [Actions.CLAIM]({ state, dispatch, getters }, { voter, bpname, password }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, voter).then(config => {
      return claim(config)({ voter, bpname });
    });
  },
  [Actions.GET_ACCOUNT_INFO]({ state, dispatch, commit, getters }) {
    const accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    return getAccountInfo(getters[Getters.CURRENT_NODE])(accountName)
      .then(({ info, bpsTable }) => {
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
