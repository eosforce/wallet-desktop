import { Mutations, Actions, Getters } from '@/constants/types.constants';
import { getAccountInfo, transfer, getTransferRecord, getBpsTable, vote, unfreeze, claim } from '@/services/Eos';

const initState = {
  accountName: '',
  info: {},
  bpsTable: [],
  transferRecords: []
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
  [Mutations.SET_TRANSFER_RECORDS](state, { transferRecords = [] } = {}) {
    state.transferRecords = transferRecords;
  }
};

const actions = {
  [Actions.REFRESH_APP]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_ACCOUNT, { accountName: state.accountName });
  },
  [Actions.FETCH_ACCOUNT]({ commit, dispatch }, { accountName }) {
    commit(Mutations.SET_ACCOUNT_NAME, { accountName });
    dispatch(Actions.GET_ACCOUNT_INFO);
  },
  [Actions.TRANSFER]({ state, dispatch, getters }, { from, to, amount, password }) {
    return getters[Getters.GET_TRANSE_CONFIG](password, from).then(config => {
      return transfer(config)({ from, to, amount });
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
    return getAccountInfo(getters[Getters.CURRENT_NODE])(accountName).then(({ info, bpsTable }) => {
      commit(Mutations.SET_ACCOUNT_INFO, { info });
      commit(Mutations.SET_BPS_TABLE, { bpsTable });
      return dispatch(Actions.GET_TRANSFER_RECORD, { accountName });
    });
  },
  [Actions.GET_TRANSFER_RECORD]({ commit, getters }, { accountName, pos, offset }) {
    return getTransferRecord(getters[Getters.CURRENT_NODE])({ accountName, pos, offset }).then(result => {
      commit(Mutations.SET_TRANSFER_RECORDS, { transferRecords: result.actions });
    });
  }
};

const getters = {
  [Getters.CURRENT_ACCOUNT_NAME](state, getters, rootState) {
    return state.accountName;
  }
};

export default {
  state: initState,
  mutations,
  actions,
  getters
};
