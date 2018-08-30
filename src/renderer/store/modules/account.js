import { Mutations, Actions, Getters } from '@/constants/types.constants';
import { 
  getAccountInfo, 
  transfer, 
  getAvailable, 
  getTransferRecord, 
  vote, 
  unfreeze, 
  claim, 
  getTokenList, 
  transfer_account,
  getAccount,
  getRewardsAndBpsTable,
  getGlobalTable,
  count_asset_total
} from '@/services/Eos';

const initState = {
  accountName: '',
  info: {
    assetTotal: 0,
    available: 0,
    stakedTotal: 0,
    unstakingTotal: 0,
    rewardTotal: 0,
    baseInfo: {}
  },
  version: '',
  bpsTable: [],
  baseBpsTable: [],
  votesTable: [],
  superBpsAmountTable: [],
  transferRecords: {
    offset: 20,
    pos: 0,
    list: [],
    more: true
  },
  tokenList: [],
  on_load_info: false,
  pre_load_key: '',
  on_load_bps_table: false,
  pre_load_bps_key: '',
  on_load_actions: false,
  pre_load_action_key: '',
  on_load_token: false,
  pre_load_token_key: '',
  load_key: 0,
  cancle_requests: {
    cancel: []
  }
};

const mutations = {
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
  [Mutations.SET_BASE_BPS_TABLE](state, { bpsTable = [] } = {}) {
    state.baseBpsTable = bpsTable;
  },
  [Mutations.SET_VOTES_TABLE](state, { votesTable = [] } = {}) {
    state.votesTable.splice(0, state.votesTable.length, ...votesTable);
  },
  [Mutations.SET_SUPER_PSAMOUNT_TABLE](state, { superBpsAmountTable = [] } = {}) {
    state.superBpsAmountTable.splice(0, state.superBpsAmountTable.length, ...superBpsAmountTable);
  },
  [Mutations.SET_TRANSFER_RECORDS](state, { transferRecords = {} } = {}) {
    if (transferRecords.list.length < state.transferRecords.offset) {
      state.transferRecords.more = false;
    }
    state.transferRecords.list.splice(state.transferRecords.list.length, 0, ...transferRecords.list);
    let recode_map = {};
    let records = [];
    state.transferRecords.list.map(item => {
      if (recode_map[item.action_trace.trx_id]) return;
      recode_map[item.action_trace.trx_id] = item;
      records.push(item);
    });
    state.transferRecords.list.splice(0, state.transferRecords.list.length, ...records);
    state.transferRecords.list.sort((pre, cur) => {
      if(cur.block_num > pre.block_num) return 1;
      return -1;
    })
    state.transferRecords.pos = state.transferRecords.list.length;
  },
  [Mutations.SET_TOKEN_LIST](state, { tokenList = [] } = {}) {
    state.tokenList = tokenList;
  },
  [Mutations.START_LOAD_ACCOUNT_INFO](state, { accountName }){
    if (accountName == state.pre_load_key) return;
    state.on_load_info = true;
    state.pre_load_key = accountName;
  },
  [Mutations.FINISH_LOAD_ACCOUNT_INFO](state){
    state.on_load_info = false;
  },
  [Mutations.SET_VERSION](state, { version = '' }){
    state.version = version;
  },
  update_available (state, available) {
    state.info.available = available;
  },
  update_base_info (state, baseInfo) {
    state.info.baseInfo = baseInfo;
  },
  start_on_load_bps_table (state, accountName) {
    if (accountName == state.pre_load_bps_key) return;
    state.on_load_bps_table = true;
    state.pre_load_bps_key = accountName;
  },
  finish_on_load_bps_table (state, accountName) {
    state.on_load_bps_table = false;
  },
  start_on_load_actions (state, accountName) {
    if (accountName == state.pre_load_action_key) return;
    state.on_load_actions = true;
    state.pre_load_action_key = accountName;
  },
  finish_on_load_actions (state) {
    state.on_load_actions = false;
  },
  start_on_load_token (state, accountName) {
    if (accountName == state.pre_load_token_key) return;
    state.on_load_token = true;
    state.pre_load_token_key = accountName;
  },
  finish_on_load_token (state) {
    state.on_load_token = false;
  },
  set_staked_total (state, stake_total) {
    state.info.stakedTotal = stake_total;
  },
  set_unstaking_total (state, unstaking_total) {
    state.info.unstakingTotal = unstaking_total;
  },
  set_reward_total (state, reward_total) {
    state.info.rewardTotal = reward_total;
  },
  set_asset_total (state, asset_total) {
    state.info.assetTotal = asset_total;
  },
  clear_info (state) {
    state.info.stakedTotal = 0;
    state.info.unstakingTotal = 0;
    state.info.rewardTotal = 0;
    state.info.assetTotal = 0;
    state.info.baseInfo = {};
    state.pre_load_action_key = '';
    state.pre_load_bps_key = '';
    state.pre_load_token_key = '';
    state.votesTable = [];
  },
  set_cancle_requests (state, cancel) {
    for(let item of cancel){
      state.cancle_requests.cancel.push(item);
    }
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
  check_total_and_set_asset_total({state, dispatch, commit, getters}) {
    let is_loaded_all = true;
    let except_key = ['assetTotal', 'baseInfo'];
    for(let item in state.info){
      if (!state.info[item] && except_key.indexOf(item) < 0) {
        is_loaded_all = false;
      }
    }
    if(is_loaded_all){
      let asset_total = count_asset_total(
        state.info.available,
        state.info.stakedTotal,
        state.info.unstakingTotal,
        state.info.rewardTotal
      )
      commit('set_asset_total', asset_total);
      commit(Mutations.FINISH_LOAD_ACCOUNT_INFO);
    }
    return is_loaded_all;
  },
  start_load_new_account({state, dispatch, commit, getters}) {
    const accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    if(accountName != state.pre_load_key){
      commit('clear_info');
      commit('RESET_ACCOUNT_INFO');
    }
    commit('start_on_load_bps_table', accountName);
    commit(Mutations.START_LOAD_ACCOUNT_INFO, { accountName });
  },
  async [Actions.GET_GLOABLE_INFO]({ state, dispatch, commit, getters }) {
    let accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    let node_url = getters[Getters.CURRENT_NODE];
    let current_node_info = getters[Getters.CURRENT_NODE_INFO]
    let { votesTable, bpsTable, superBpsAmountTable } = await getGlobalTable(node_url)(accountName, current_node_info);
    commit(Mutations.SET_VOTES_TABLE, {votesTable});
    commit(Mutations.SET_BASE_BPS_TABLE, {bpsTable});
    commit(Mutations.SET_SUPER_PSAMOUNT_TABLE, {superBpsAmountTable});
  },
  async [Actions.GET_ACCOUNT_INFO]({ state, dispatch, commit, getters }, key) {
    const accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    let node_url = getters[Getters.CURRENT_NODE];
    if (accountName != state.pre_load_key) {
      for(let item of state.cancle_requests.cancel){
        item();
      }
    }
    dispatch('start_load_new_account');
    let cancle_requests = {
      'cancel': []
    }
    commit('set_cancle_requests', cancle_requests.cancel);
    var baseBpsTable = state.baseBpsTable.length > 0 ? JSON.parse(JSON.stringify(state.baseBpsTable)) : null;
    var votesTable = state.votesTable.length > 0 ? JSON.parse(JSON.stringify(state.votesTable)) : null;
    var superBpsAmountTable = state.superBpsAmountTable.length > 0 ? JSON.parse(JSON.stringify(state.superBpsAmountTable)) : null;
    var {bpsTable, stakedTotal, unstakingTotal, rewardTotal, version} = await getRewardsAndBpsTable(node_url)(
      accountName, 
      getters[Getters.CURRENT_NODE_INFO],
      cancle_requests,
      votesTable,
      baseBpsTable,
      superBpsAmountTable
    );

    if (accountName != state.pre_load_key) {
      return;
    }

    commit(Mutations.SET_VERSION, {version});
    commit(Mutations.SET_BPS_TABLE, { bpsTable });
    commit('finish_on_load_bps_table');
    commit('set_staked_total', stakedTotal);
    commit('set_unstaking_total', unstakingTotal);
    commit('set_reward_total', rewardTotal);

    dispatch('check_total_and_set_asset_total');

    await getAvailable(node_url)(accountName, cancle_requests)
      .then(available => {
        if (accountName != state.pre_load_key) {
          return;
        }
        commit('update_available', available);
        dispatch('check_total_and_set_asset_total');
      });

    commit('set_cancle_requests', cancle_requests.cancel);

    await getAccount(node_url)(accountName, cancle_requests)
      .then(baseInfo => {
        if (accountName != state.pre_load_key) {
          return;
        }
        commit('update_base_info', baseInfo);
        dispatch('check_total_and_set_asset_total');
      });

    commit('set_cancle_requests', cancle_requests.cancel);
  },
  [Actions.GET_TRANSFER_RECORD]({ state, commit, getters }, {accountName, pos, offset, cancle_requests, finished = () => {}}) {
    offset = offset || state.transferRecords.offset;
    if (!pos) {
      pos = pos === undefined ? state.transferRecords.pos : pos;
    }
    commit('start_on_load_actions', accountName);
    return getTransferRecord(getters[Getters.CURRENT_NODE])({accountName, pos, offset, cancle_requests})
      .then(result => {
        if(accountName != state.pre_load_action_key) return;
        commit(Mutations.SET_TRANSFER_RECORDS, { transferRecords: { list: result.actions, pos, offset } });
        commit('finish_on_load_actions');
        finished();
      }
    );
  },
  [Actions.GET_TOKEN_LIST]({state, dispatch, commit, getters}, {accountName, cancle_requests}) {
    commit('start_on_load_token', accountName);
    return getTokenList(getters[Getters.CURRENT_NODE])(accountName, cancle_requests).then(result => {
      if(accountName != state.pre_load_token_key) return;
      commit(Mutations.SET_TOKEN_LIST, { tokenList: result });
      commit('finish_on_load_token');
    });
  },
  [Actions.GET_BPS_TABLE]({ state, dispatch, commit, getters }) {
    let accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    let current_node_info = getters[Getters.CURRENT_NODE_INFO];
    var baseBpsTable = state.baseBpsTable.length > 0 ? JSON.parse(JSON.stringify(state.baseBpsTable)) : null;
    var votesTable = state.votesTable.length > 0 ? JSON.parse(JSON.stringify(state.votesTable)) : null;
    var superBpsAmountTable = state.superBpsAmountTable.length > 0 ? JSON.parse(JSON.stringify(state.superBpsAmountTable)) : null;
    return getAccountInfo(getters[Getters.CURRENT_NODE])(
      accountName, current_node_info, {cancel: []}, votesTable, baseBpsTable, superBpsAmountTable).then(({ bpsTable }) => {
      if (accountName != state.pre_load_key) {
        return;
      }
      commit(Mutations.SET_BPS_TABLE, { bpsTable });
    });
  },
  [Actions.GET_ACCOUNT_OVERVIEW]({ state, dispatch, commit, getters }) {
    let accountName = getters[Getters.CURRENT_ACCOUNT_NAME];
    let current_node_info = getters[Getters.CURRENT_NODE_INFO];
    var baseBpsTable = state.baseBpsTable.length > 0 ? JSON.parse(JSON.stringify(state.baseBpsTable)) : null;
    var votesTable = state.votesTable.length > 0 ? JSON.parse(JSON.stringify(state.votesTable)) : null;
    var superBpsAmountTable = state.superBpsAmountTable.length > 0 ? JSON.parse(JSON.stringify(state.superBpsAmountTable)) : null;
    return getAccountInfo(getters[Getters.CURRENT_NODE])(
      accountName, current_node_info, {cancel: []}, votesTable, baseBpsTable, superBpsAmountTable).then(({ info }) => {
      if (accountName != state.pre_load_key) {
        return;
      }
      commit(Mutations.SET_ACCOUNT_INFO, { info });
    });
  },
  async [Actions.TRANSFER_ACCOUNT]({ state, dispatch, commit, getters }, { name, publick_key, password, walletId, permissions = ['active', 'owner'] }) {
    let with_out_reject = true;
    let config = await getters[Getters.GET_TRANSE_CONFIG](password, name, walletId, with_out_reject);
    if (config.is_error){
      return config;
    }
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
