import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletIdList, createWalletData, getWalletKeyFromId, deleteWalletData } from '@/services/Storage';
import { getNodeList, getAccounts, getNodeInfo } from '@/services/Eos';
import { decryptWif } from '@/utils/util';

import { NODE_LIST_KEY, CHAIN_NETS, CHAIN_NET_KEY } from '@/constants/config.constants';

const initState = {
  walletIdList: [],
  fee: '0.01 EOS',
  nodeList: [],
  currentNodeValue: '',
  currentNodeInfo: null,
  walletList: [],
  chainNet: '',
};

const mutations = {
  [Mutations.SET_WALLET_ID_LIST](state, { walletIdList }) {
    state.walletIdList = walletIdList;
  },
  [Mutations.SET_NODE_LIST](state, { nodeList }) {
    state.nodeList = nodeList;
  },
  [Mutations.SET_CHAIN_NET](state, { chainNet }) {
    document.title = `EOSForce钱包 ${CHAIN_NETS[chainNet]}`;
    state.chainNet = chainNet;
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
      initPromise = dispatch(Actions.FETCH_NODE_LIST)
        .then(data => {
          const syncPromise = dispatch(Actions.SYNC_NODE_LIST);
          return data || syncPromise;
        })
        .then(data => {
          if (data && data.nodes) {
            const nodeList = data.nodes.reduce((result, node) => {
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
          } else {
            return Promise.reject(new Error('获取节点列表错误'));
          }
        });
    }
    return initPromise;
  },
  [Actions.REFRESH_APP]({ state, commit, dispatch }) {
    dispatch(Actions.FETCH_WALLET_LIST);
    dispatch(Actions.FETCH_NODE_INFO);
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
  [Actions.DELETE_WALLET]({ state, getters, dispatch }, { publicKey }) {
    return deleteWalletData({ publicKey });
  },
  [Actions.FETCH_NODE_INFO]({ commit, state }, { node } = {}) {
    return getNodeInfo(node || state.currentNodeValue).then(result => {
      // node 为空使用当前节点值，这个时候不设置节点的值，避免定时刷新任务和其他请求交错，然后程序出错。
      if (node) {
        commit(Mutations.SET_CUREENT_NODE, { currentNodeValue: node });
      }
      commit(Mutations.SET_CURRENT_NODE_INFO, {
        currentNodeInfo: { http_endpoint: state.currentNodeValue, ...result },
      });
    });
  },
  [Actions.FETCH_NODE_LIST]({ commit, dispatch, state }) {
    return Storage.setPath(CHAIN_NET_KEY)
      .fetch()
      .then(data => {
        if (!data) return Object.keys(CHAIN_NETS)[0];
        return data.key;
      })
      .then(key => {
        return Storage.setPath(CHAIN_NET_KEY)
          .store({ key })
          .then(data => data.key);
      })
      .then(key => {
        commit(Mutations.SET_CHAIN_NET, { chainNet: key });
        return Storage.setPath(`${NODE_LIST_KEY}#${state.chainNet}`).fetch();
      });
  },
  [Actions.SYNC_NODE_LIST]({ state }) {
    return getNodeList().then(data => {
      return Storage.setPath(`${NODE_LIST_KEY}#${state.chainNet}`).store(data);
    });
  },
  [Actions.SWITCH_CHAIN_NET]({ state }, { chainNet }) {
    return Storage.setPath(CHAIN_NET_KEY)
      .store({ key: chainNet })
      .then(() => {
        location.reload();
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
