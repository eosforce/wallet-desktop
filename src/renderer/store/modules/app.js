import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletIdFromKey, getWalletIdList, createWalletData, getWalletKeyFromId } from '@/services/Storage';
import { createLocalNet, getNodeList, getAccounts, getNodeInfo } from '@/services/Eos';
import { decryptWif } from '@/utils/util';

const initState = {
  walletIdList: [],
  fee: '0.01 EOS',
  nodeList: [],
  currentNodeValue: '',
  currentNodeInfo: null,
  walletList: [],
};

const mutations = {
  [Mutations.SET_WALLET_ID_LIST](state, { walletIdList }) {
    state.walletIdList = walletIdList;
  },
  [Mutations.SET_NODE_LIST](state, { nodeList }) {
    state.nodeList = nodeList;
  },
  [Mutations.SET_WALLET_LIST](state, { walletList }) {
    state.walletList = walletList;
  },
  [Mutations.SET_CUREENT_NODE](state, { currentNodeValue }) {
    state.currentNodeValue = currentNodeValue;
  },
  [Mutations.SET_CURRENT_NODE_INFO](state, { currentNodeInfo }) {
    state.currentNodeInfo = currentNodeInfo;
  },
};

let initPromise;

const actions = {
  [Actions.INIT_APP]({ state, commit, dispatch }) {
    if (!initPromise) {
      initPromise = getNodeList().then(_nodeList => {
        const nodeList = _nodeList.reduce((result, node) => {
          const r = {};
          if (node.port_ssl) {
            r.value = `https://${node.node_addr}:${node.port_ssl}`;
          } else {
            r.value = `http://${node.node_addr}:${node.port_http}`;
          }
          r.name = `${node.node_name} ${node.location} ${r.value}`;
          result.push(r);
          return result;
        }, []);
        commit(Mutations.SET_NODE_LIST, { nodeList });
        return dispatch(Actions.FETCH_NODE_INFO, { node: nodeList[0] && nodeList[0].value });
      });
    }
    return initPromise;
  },
  [Actions.REFRESH_APP]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_WALLET_LIST);
    dispatch(Actions.FETCH_NODE_INFO, { node: state.currentNodeValue });
  },
  [Actions.FETCH_WALLET_LIST]({ state, commit, getters }) {
    commit(Mutations.SET_WALLET_ID_LIST, { walletIdList: getWalletIdList() });
    return Promise.all(
      state.walletIdList.map(pk => {
        return getAccounts(getters[Getters.CURRENT_NODE])(pk).then(list => {
          return {
            publicKey: pk,
            accounts: list,
          };
        });
      })
    ).then(result => commit(Mutations.SET_WALLET_LIST, { walletList: result }));
  },
  [Actions.NEW_WALLET]({ dispatch }, { privateKey, password }) {
    return createWalletData({ privateKey, password });
  },
  [Actions.FETCH_NODE_INFO]({ commit, state }, { node }) {
    return getNodeInfo(node).then(result => {
      commit(Mutations.SET_CUREENT_NODE, { currentNodeValue: node });
      commit(Mutations.SET_CURRENT_NODE_INFO, {
        currentNodeInfo: { http_endpoint: state.currentNodeValue, ...result },
      });
    });
  },
};

const getters = {
  [Getters.CURRENT_NODE_INFO](state) {
    return state.currentNodeInfo;
  },
  [Getters.CURRENT_NODE](state) {
    return state.currentNodeValue;
  },
  [Getters.ACCOUT_MAP](state) {
    const result = {};
    for (const wallet of state.walletList) {
      const publicKey = wallet.publicKey;
      for (const name of wallet.accounts) {
        result[name] = publicKey;
      }
    }
    return result;
  },
  [Getters.GET_TRANSE_CONFIG]: (state, getters) => (password, name) => {
    const walletId = getters[Getters.ACCOUT_MAP][name];
    return Storage.setPath(getWalletKeyFromId(walletId))
      .fetch()
      .then(walletData => {
        return decryptWif(password, walletData.crypto);
      })
      .then(wif => {
        return {
          keyProvider: wif,
          httpEndpoint: state.currentNodeInfo.http_endpoint,
          chainId: state.currentNodeInfo.chain_id,
        };
      });
  },
};

export default {
  state: initState,
  mutations,
  actions,
  getters,
};
