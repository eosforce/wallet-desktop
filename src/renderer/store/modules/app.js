import { Mutations, Actions, Getters } from '@/constants/types.constants';

import Storage, { getWalletIdList, createWalletData, getWalletKeyFromId, deleteWalletData } from '@/services/Storage';
import { getNodeList, getAccounts, getNodeInfo, getBpNick, getBlock } from '@/services/Eos';
import { decryptWif, get_involved_users_form_blocks } from '@/utils/util';

import { NODE_LIST_KEY, CHAIN_NETS, CHAIN_NET_KEY } from '@/constants/config.constants';

const initState = {
    walletIdList: [],
    fee: '0.01 EOS',
    nodeList: [],
    currentNodeValue: '',
    currentNodeInfo: null,
    currentBlock: null,
    block_list: [],
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
    is_load_accounts: true
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
        let last_block = state.block_list[state.block_list.length - 1];
        // 更新到连续区块
        if (last_block) {
            if (last_block.head_block_num == currentNodeInfo.head_block_num) return;
            let len = currentNodeInfo.head_block_num - last_block.head_block_num;
            for (var i = len - 1; i > 0; i--) {
                state.block_list.push({
                    head_block_num: currentNodeInfo.head_block_num - i
                });
            }
        }
        state.block_list.push(currentNodeInfo);
    },
    [Mutations.SET_BP_NICK](state, { bpNicks }) {
        state.bpNicks = bpNicks;
    },
    [Mutations.SET_UPDATE_INFO](state, { update }) {
        state.update = { ...state.update, ...update };
    },
    [Mutations.START_LOAD_ACCOUNT_LIST](state) {
        if (state.walletList.length) return;
        state.is_load_accounts = true;
    },
    [Mutations.FINISH_LOAD_ACCOUNT_LIST](state) {
        state.is_load_accounts = false;
    },
    // 设置当前最高区块
    [Mutations.SET_BLOCK](state, { block }) {
        state.currentBlock = block;
    },
    [Mutations.UPDATE_BLOCK_LIST_STATUS](state, { block_num, block }) {
        state.block_list.forEach(item => {
            if (item.head_block_num == block_num) {
                item.block = block;
            }
        });
    }
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
    async [Actions.DELETE_ACCOUNT]({ state, commit, dispatch, getters }, { account, publicKey }) {
        let has_removed = -1;
        let wallet_account_map = [];
        for (let row of state.walletList) {
            var new_row = JSON.parse(JSON.stringify(row));
            for (let item of new_row.accounts) {
                if (new_row.publicKey === publicKey && item === account) {
                    let index = new_row.accounts.indexOf(account);
                    if (index > -1) {
                        row.accounts.splice(index, 1);
                        has_removed = wallet_account_map.length;
                    }
                }
                if (new_row.publicKey === publicKey && item === account) wallet_account_map.push({ account: item, publicKey: new_row.publicKey });
            }
        }
        return wallet_account_map[has_removed] || null;
    },
    [Actions.REFRESH_APP]({ state, commit, dispatch }) {
        dispatch(Actions.FETCH_WALLET_LIST);
        dispatch(Actions.FETCH_NODE_INFO);
    },
    [Actions.FETCH_WALLET_LIST]({ state, commit, getters }) {
        commit(Mutations.START_LOAD_ACCOUNT_LIST);
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
        ).then(result => {
            commit(Mutations.SET_WALLET_LIST, { walletList: result });
            commit(Mutations.FINISH_LOAD_ACCOUNT_LIST);
        }).catch(err => {
            dispatch(Actions.FETCH_WALLET_LIST);
        });
    },
    [Actions.FETCH_ALL_WALLET_LIST]({ state, commit, getters }) {
        // getAccounts(getters[Getters.CURRENT_NODE])(pk)
    },
    [Actions.NEW_WALLET]({ dispatch }, { privateKey, password }) {
        return createWalletData({ privateKey, password });
    },
    [Actions.DELETE_WALLET]({ state, getters, dispatch }, { publicKey }) {
        return deleteWalletData({ publicKey });
    },
    [Actions.FETCH_NODE_INFO]({ commit, state, dispatch }, { node } = {}) {
        return getNodeInfo(node || state.currentNodeValue).then(result => {
            // node 为空使用当前节点值，这个时候不设置节点的值，避免定时刷新任务和其他请求交错，然后程序出错。
            if (!result) return;
            if (node) {
                commit(Mutations.SET_CUREENT_NODE, { currentNodeValue: node });
            }
            commit(Mutations.SET_CURRENT_NODE_INFO, {
                currentNodeInfo: { http_endpoint: state.currentNodeValue, ...result },
            });
            dispatch(Actions.FETCH_BLOCK);
        });
    },
    async [Actions.FETCH_BLOCK]({ state, commit, dispatch }) {
        let block_update_queue = [];
        // 最近的连续的十个未更新过的块进行，更新
        state.block_list.slice(state.block_list.length - 10, state.block_list.length).filter(item => {
            if (!item.block) {
                block_update_queue.push( getBlock(state.currentNodeValue)(item.head_block_num) );
            }
        });
        Promise.all(block_update_queue)
        .then(block_list_res => {
            block_list_res.forEach((item, index) => {
                if(!item){
                    return ;
                }
                commit(Mutations.UPDATE_BLOCK_LIST_STATUS, { block_num: item.block_num, block: item });
            });
            let last_block = block_list_res[block_list_res.length - 1];
            if(last_block){
                commit(Mutations.SET_BLOCK, { block: last_block });
            }
            // 最近的块中是否涉及自己的变更
            dispatch(Actions.CHECK_INVOLED, get_involved_users_form_blocks(block_list_res));
            // 检查交易状态
            dispatch(Actions.CHECK_TRANSACTION);
        })
        // let block_list_res = await Promise.all(block_update_queue);
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
        return getNodeList().then(async data => {
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
    [Getters.CURRENT_BLOCK](state) {
        return state.currentBlock;
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
    [Getters.GET_TRANSE_CONFIG]: (state, getters) => (password, name, walletId, with_out_reject = false) => {
        walletId = walletId || getters[Getters.ACCOUT_MAP][name];
        const httpEndpoint = state.writeNodeList[Math.floor(Math.random() * state.writeNodeList.length)].value;
        return Storage.setPath(getWalletKeyFromId(walletId))
            .fetch()
            .then(async(walletData) => {
                return decryptWif(password, walletData.crypto);
            })
            .then(wif => {
                return {
                    keyProvider: wif,
                    httpEndpoint: httpEndpoint,
                    chainId: state.currentNodeInfo.chain_id,
                };
            })
            .catch(err => {
                if (with_out_reject) {
                    return {
                        is_error: true,
                        message: err.message
                    }
                }
                return Promise.reject(err);
            });
    },
};

export default {
    state: initState,
    mutations,
    actions,
    getters,
};