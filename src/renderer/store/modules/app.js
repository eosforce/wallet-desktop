import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletIdList, createWalletData, getWalletKeyFromId, deleteWalletData } from '@/services/Storage';
import { getNodeList, getAccounts, getNodeInfo, getBpNick } from '@/services/Eos';
import { decryptWif } from '@/utils/util';

import { NODE_LIST_KEY, CHAIN_NETS, CHAIN_NET_KEY } from '@/constants/config.constants';

const initState = {
  walletIdList: [],
  fee: '0.01 EOS',
  nodeList: [],
  currentNodeValue: '',
  currentNodeInfo: null,
  walletList: [],
  writeNodeList: [],
  chainNet: '',
  bpNicks: {
    zh: {},
    en: {},
  },
  update: {
    startUpdate: false,
    progress: 0,
    speed: 0,
    total: 0,
  },
};

const mutations = {
  [Mutations.SET_WALLET_ID_LIST](state, { walletIdList }) {
    state.walletIdList = walletIdList;
  },
  [Mutations.SET_NODE_LIST](state, { nodeList }) {
    state.nodeList = nodeList;
  },
  [Mutations.SET_WRITE_NODE_LIST](state, { writeNodeList }) {
    state.writeNodeList = writeNodeList;
  },
  [Mutations.SET_CHAIN_NET](state, { chainNet }) {
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
  [Mutations.SET_BP_NICK](state, { bpNicks }) {
    state.bpNicks = bpNicks;
  },
  [Mutations.SET_UPDATE_INFO](state, { update }) {
    state.update = { ...state.update, ...update };
  },
};

let initPromise;

const actions = {
  [Actions.INIT_APP]({ state, commit, dispatch }) {
    if (!initPromise) {
      initPromise = dispatch(Actions.FETCH_NODE_LIST)
        .then(data => {
          const syncPromise = dispatch(Actions.SYNC_NODE_LIST);
          return syncPromise;
        })
        .then(data => {
          if (data && data.nodes) {
            const allNodeList = data.nodes.reduce((result, node) => {
              const r = {};
              if (node.port_ssl) {
                r.value = `https://${node.node_addr}:${node.port_ssl}`;
              } else {
                r.value = `http://${node.node_addr}:${node.port_http}`;
              }
              r.name = `${node.node_name} ${node.location} ${r.value}`;
              if (node.type) {
                r.type = node.type;
              }
              result.push(r);
              return result;
            }, []);
            const nodeList = allNodeList.filter(n => n.type === '10');
            const writeNodeList = allNodeList.filter(n => n.type === '20');
            commit(Mutations.SET_NODE_LIST, { nodeList });
            commit(Mutations.SET_WRITE_NODE_LIST, { writeNodeList });
            const randomIndex = Math.floor(Math.random() * nodeList.length);
            return dispatch(Actions.FETCH_NODE_INFO, { node: nodeList[randomIndex] && nodeList[randomIndex].value });
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
  async [Actions.ADD_NODE] ({state}) {
    let data = await Storage.setPath(`${NODE_LIST_KEY}#${state.chainNet}`).fetch()
    let new_node = {'location': '北京_2', 'node_addr': '47.98.249.86', 'node_name': 'test', 'port_http': '8888', 'port_p2p': '6666', 'port_ssl': '', 'type': '10'};
    let len = data.nodes.length;
    data.nodes.splice(0, 0, new_node);
    let p_new_node = Object.assign({}, new_node);
    p_new_node.type = '20';
    data.nodes.splice(len/2 + 1, 0, p_new_node);
    // Storage.setPath(`${NODE_LIST_KEY}#${state.chainNet}`).store(data).then(() => {});
  },
  [Actions.SYNC_NODE_LIST]({ state }) {
    return getNodeList().then(async data => {
      // let nodes = await Storage.setPath(`${NODE_LIST_KEY}#${state.chainNet}`).fetch();
      let nodes = {'nodes': [{'location': '北京_2', 'node_addr': '47.98.249.86', 'node_name': 'test', 'port_http': '8888', 'port_p2p': '6666', 'port_ssl': '', 'type': '10'}]};
      if(nodes && nodes.nodes){
        let node_set = new Set();
        let test_nodes = [];
        nodes.nodes.filter(item => {
          if(item.node_name && item.type == 10){
            node_set.add(JSON.stringify(item));
            return item;
          }
          return false;
        })
        for(let node_item of node_set){test_nodes.push(JSON.parse(node_item))};
        for(let test_node of test_nodes){
          data.nodes.splice(0, 0, test_node);
          let p_new_node = Object.assign({}, test_node);
          p_new_node.type = '20';
          data.nodes.splice(parseInt(data.nodes.length/2) + 1, 0, p_new_node);
        }
      }
      // console.log(data.nodes.length);
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
  [Actions.GET_BP_NICK]({ state, commit }) {
    return getBpNick().then(data => {
      commit(Mutations.SET_BP_NICK, {
        bpNicks: data,
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
    const httpEndpoint = state.writeNodeList[Math.floor(Math.random() * state.writeNodeList.length)].value;
    return Storage.setPath(getWalletKeyFromId(walletId))
      .fetch()
      .then(walletData => {
        return decryptWif(password, walletData.crypto);
      })
      .then(wif => {
        return {
          keyProvider: wif,
          httpEndpoint: httpEndpoint,
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
