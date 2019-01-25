import Eos from 'eosforce'
import EOS_ML from 'eosjs'
import axios from 'axios'
import { NODE_API_URL } from '@/constants/config.constants';
import Store from '@/store';

import {
  getToken,
  toAsset,
  toBigNumber,
  calcVoteExist,
  calcTotalAmount,
  handleApiError,
  calcVoteage,
  calcReward,
  calcApr,
  get_error_msg,
  get_node_version_num,
  string_to_name
} from '@/utils/util';

const API = {
  'get_info': '/v1/chain/get_info',
  'get_block': '/v1/chain/get_block',
  'get_key_accounts': '/v1/history/get_key_accounts',
  'get_actions': '/v1/history/get_actions',
  'get_transaction': '/v1/history/get_transaction',
  'get_account': '/v1/chain/get_account',
  'get_table_rows': '/v1/chain/get_table_rows'
}

export const getBpNick = () => {
  return fetch('https://updatewallet.oss-cn-hangzhou.aliyuncs.com/eosforce/bp-nickname.json').then(res => res.json());
};

export const getNodeList = async () => {
  const map = {
    '1.0': NODE_API_URL,
  };
  return fetch(map[Store.state.app.chainNet]).then(async res => {
    let data = await res.json();
    //trans_main
    // data.nodes.forEach(item => {
    //   item.node_addr = '192.168.2.139';
    //   item.port_http = '8877';
    //   item.port_ssl = '';
    // });
    return data;
  });
};

export const rank_get_action = (version_str) => {
  // version_str = 'v1.0.3-9-g6782484'; 是否修改了 get_action 检测
  if (!version_str) {
    return false;
  }
  let num = get_node_version_num(version_str);
  if (num > 10000003000900){
      return true;
  }
  return false;
}

// 获取节点信息
export const getNodeInfo = async (httpEndpoint) => {
    let data = await axios.post(httpEndpoint + API.get_info, {})
    .then(data => {
      return data.data;
    })
    .catch(err => {
      return null;
    })
    return data;  
};

// 查询块信息
export const getBlock = httpEndpoint => async (block_num_or_id, concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_block, 
      { 
        block_num_or_id
      },
      {
        cancelToken: new CancelToken(function executor(c) {
          concel_container.cancel.push(c);
        })
      }
    )
    .then(data => data.data)
    .catch(err => null);
  return data;
};

// 根据公钥获取用户名数组
export const getAccounts = httpEndpoint => async (publicKey) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_key_accounts, 
    { 
      public_key: publicKey
    }
  )
  .then(data => data.data.account_names)
  .catch(err => {
    return handleApiError(err)
  });
  return data;
};

// 获取交易记录
export const getTransferRecord = httpEndpoint => async ({accountName, pos, offset, concel_container = {cancel: []}}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_actions, 
    { 
      account_name: accountName, pos: pos, offset: offset
    },  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data)
  .catch(err => []);
  return data;
};

// 获取交易详情
export const getTransAction = httpEndpoint => async (tid) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_transaction, 
    { 
      id: tid
    }
  )
  .then(data => data.data)
  .catch(err => []);
  return data;
};

// 查询账户被锁定数额
export const getLockedEosc = httpEndpoint => async (account_name, concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_table_rows, 
    {
      "scope": 'eosio.lock',
      "code":"eosio.lock",
      "table":"accounts",
      "table_key": account_name,
      "json":true,
      "limit":1000
    },  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data)
  .catch(err => null);
  if(!data) return data;
  if(data.rows && data.rows.length){
    let balance = data.rows.length ? data.rows[0].balance : 0;
    return toBigNumber(balance);
  }
  return toBigNumber(0);
};

// 查询账号是否存在
export const queryAccount = httpEndpoint => accountName => {
  return Eos({ httpEndpoint })
    .getTableRows({
      scope: 'eosio',
      code: 'eosio',
      table: 'accounts',
      table_key: accountName,
      limit: 10000,
      json: true,
    })
    .then(result => {
      const account = result.rows.find(acc => acc.name === accountName);
      if (account) {
        return true;
      } else {
        return false;
      }
    });
};


export const getAccount = httpEndpoint => async (accountName, concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_account, 
    { 
      account_name: accountName
    },  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data)
  .catch(err => null);
  return data;
};

const get_filter_available_condition = (accountName, filter_way = 'EOSC') => {
  let base_params = { 
    scope: 'eosio',
    code: 'eosio',
    table: 'accounts',
    table_key: accountName,
    limit: 10000,
    json: true,
  }
  if(filter_way == 'EOS'){
    base_params.scope = base_params.table_key;
    base_params.code = 'eosio.token';
    delete base_params.table_key;
  }
  return base_params;
}

const filter_main_token_by_way = (data, accountName, filter_way = 'eosio') => {

  if(filter_way == 'eosio'){
    const account = data.rows.find(acc => acc.name === accountName);
    if (account) {
      return toBigNumber(account.available);
    } else {
      return toBigNumber(0);
    }
  }

  let balance = data.rows.length ? data.rows[0].balance : 0;
  return toBigNumber(balance);
}
// 获取指定账户可用余额
export const getAvailable = httpEndpoint => async (accountName, filter_way = 'eosio', concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken,
      params = get_filter_available_condition(accountName, filter_way);
  let data = await axios.post(httpEndpoint + API.get_table_rows, 
    params,  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data)
  .catch(err => null);

  if(!data) return data;
  return filter_main_token_by_way(data, accountName, filter_way);
};

// 获取 token list
export const getTokenList = httpEndpoint => accountName => {
  return Eos({ httpEndpoint })
    .getTableRows({ scope: string_to_name(accountName), code: 'eosio.token', table: 'accounts', json: true, limit: 1000 })
    .then(data => {
      if (data.rows.length) {
        return Promise.all(
          data.rows.map(row => {
            let balance = row.balance;
            const symbol = getToken(balance);
            return Eos({ httpEndpoint })
              .getTableRows({
                scope: symbol,
                code: 'eosio.token',
                table: 'stat',
                json: true,
                limit: 1000,
              })
              .then(result => {
                const match = balance && balance.match(/\.(\d*)/);
                const precision = match && match[1] ? match[1].length : 0;
                balance = toBigNumber(balance, symbol);
                let token_config = result.rows[0];
                token_config.max_supply = toBigNumber(token_config.max_supply, symbol);
                token_config.supply = toBigNumber(token_config.supply, symbol);
                return {
                  symbol,
                  precision,
                  balance,
                  ...token_config,
                };
              });
          })
        );
      } else {
        return Promise.resolve();
      }
    });
};

// 获取 bp 表
export const getBpsTable = httpEndpoint => async (concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_table_rows, 
    { 
      scope: 'eosio',
      code: 'eosio',
      table: 'bps',
      json: true,
      limit: 1000 
    },  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data.rows)
  .catch(err => []);
  return data;
};

// 获取 vote 表
export const getVotesTable = httpEndpoint => async (accountName, table_key = '', concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(
        httpEndpoint + API.get_table_rows, 
        { 
          scope: string_to_name(accountName),
          code: 'eosio',
          table: 'votes',
          json: true,
          limit: 1000,
          table_key
        },  
        {
          cancelToken: new CancelToken(function executor(c) {
            concel_container.cancel.push(c);
          })
        }
  )
  .then(data => data.data.rows)
  .catch(err => []);
  return data;
};

// 获取 votes4ram 表
export const getVotes4ramTable = httpEndpoint => async (accountName, concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_table_rows, 
    { 
      scope: string_to_name(accountName), code: 'eosio', table: 'votes4ram', json: true, limit: 1000
    },  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data.rows)
  .catch(err => []);
  return data;
};

// table
export const getTable = httpEndpoint => async (params, concel_container = {cancel: []}) => {
  let CancelToken = axios.CancelToken;
  let data = await axios.post(httpEndpoint + API.get_table_rows, 
    { 
      ...params, json: true, limit: 1000 
    },  
    {
      cancelToken: new CancelToken(function executor(c) {
        concel_container.cancel.push(c);
      })
    }
  )
  .then(data => data.data)
  .catch(err => []);
  return data;
};

export const getFreeze = httpEndpoint => async (account_name) => {
  let freeze_res = await Eos({httpEndpoint}).getTableRows({
      scope: 'eosio',
      code: 'eosio',
      table: 'freezed',
      json: true,
      limit: 1,
      lower_bound : account_name
  });


  if(freeze_res && freeze_res.rows && freeze_res.rows.length && freeze_res.rows[0].voter != account_name){
    freeze_res.rows = [];
  }

  return freeze_res;
}

// 全局基础信息获取
export const getGlobalTable = httpEndpoint => async (accountName, current_node, block) => {
  let start_time = new Date().getTime();
  let votesTable = await getVotesTable(httpEndpoint)(accountName);
  let votes4ramTable = await getVotes4ramTable(httpEndpoint)(accountName);
  let bpsTable = await getBpsTable(httpEndpoint)();
  const { head_block_num: currentHeight } = current_node || await getNodeInfo(httpEndpoint);
  const { schedule_version } = block || await getBlock(httpEndpoint)(currentHeight);

  let version = schedule_version;
  let superBpsAmountTable = await getTable(httpEndpoint)({
    scope: 'eosio',
    code: 'eosio',
    table: 'schedules',
    table_key: schedule_version,
  }).then(result => {
    version = result.rows && result.rows[0] && result.rows[0].version;
    return result.rows && result.rows[0] && result.rows[0].producers;
  });
  return {
    votesTable,
    votes4ramTable,
    bpsTable,
    superBpsAmountTable,
    version,
  }
}

// 根据 bp 和 vote 得到分红表，返回一个对象
export const getRewardsAndBpsTable = httpEndpoint => async (accountName, current_node, concel_container = {cancel: []}, votesTable, votes4ramTable, bpsTable, superBpsAmountTable, block, vote_num_in = 'staked') => {
  votesTable = votesTable || await getVotesTable(httpEndpoint)(accountName);
  votes4ramTable = votes4ramTable || await getVotes4ramTable(httpEndpoint)(accountName);
  bpsTable = bpsTable || await getBpsTable(httpEndpoint)();

  const { head_block_num: currentHeight } = current_node || await getNodeInfo(httpEndpoint);
  const { schedule_version } = block || await getBlock(httpEndpoint)(currentHeight);
  let version = schedule_version;
  superBpsAmountTable = superBpsAmountTable || await getTable(httpEndpoint)({
    scope: 'eosio',
    code: 'eosio',
    table: 'schedules',
    table_key: schedule_version,
  }).then(result => {
    version = result.rows && result.rows[0] && result.rows[0].version;
    return result.rows && result.rows[0] && result.rows[0].producers;
  });
  const rewardsTable = [];
  const superBpTable = [];
  const commonBpTable = [];
  let all_bp_total_staked = 0;
  bpsTable.forEach(item => {
    all_bp_total_staked += item.total_staked;
  })
  // all_bp_total_staked
  let bpInfo;
  for (const bpRow of bpsTable) {
    for (let i = 0; i < superBpsAmountTable.length; i++) {
      if (superBpsAmountTable[i].bpname === bpRow.name) {
        bpRow.isSuperBp = true;
        bpRow.version = version;
        bpRow.amount = superBpsAmountTable[i].amount;
        break;
      }
    }

    const vote = votesTable.find(row => row.bpname === bpRow.name);
    const ramvote = votes4ramTable.find(row => row.bpname === bpRow.name);
    if (bpRow.name === accountName) {
      bpInfo = {
        bpname: bpRow,
        ...bpRow,
      };
    }

    // 年化利率
    const bpVoteage = calcVoteage([
      bpRow.total_voteage,
      bpRow.total_staked,
      currentHeight,
      bpRow.voteage_update_height,
    ]);
    bpRow.bpVoteage = bpVoteage;

    let vote_own_percent = bpRow.total_staked / all_bp_total_staked;
    bpRow.adr = 0;
    if (currentHeight > 8000) {
      if (vote_own_percent > 0.005 ) {
          bpRow.adr = calcApr(bpRow.total_staked, bpRow.commission_rate, vote_own_percent, true);
      }
    }else{
      bpRow.adr = calcApr(bpRow.total_staked, bpRow.commission_rate, vote_own_percent, false);
    }

    if (vote) {
      // 我的最新票龄
      const myVoteage = calcVoteage([vote.voteage, vote.staked, currentHeight, vote.voteage_update_height]);
      // 节点最新票龄
      // 我的分红
      const reward = calcReward([myVoteage, bpVoteage, bpRow.rewards_pool]);
      // vote_own_percent
      const extraRow = { bpname: vote.bpname, reward, ...vote };

      rewardsTable.push({ ...extraRow });

      bpRow.vote = { ...extraRow };
      bpRow.hasVote = vote.staked ? calcVoteExist(vote.staked, reward, vote.unstaking) : calcVoteExist(vote.vote, reward, vote.unstaking);
    }

    if(ramvote){
      const reward = 0;
      const extraRow = { bpname: ramvote.bpname, reward, ...ramvote };
      rewardsTable.push({...extraRow});
      bpRow.ramvote = { ...extraRow };
      bpRow.hasRamvote = ramvote.staked ? calcVoteExist(ramvote.staked, reward, ramvote.unstaking) : calcVoteExist(ramvote.vote, reward, ramvote.unstaking);
    }

    if (bpRow.isSuperBp) {
      superBpTable.push(bpRow);
    } else {
      commonBpTable.push(bpRow);
    }
    
  }
  let stakedTotal = calcTotalAmount(votesTable, vote_num_in);

  const unstakingTotal = calcTotalAmount(votesTable, 'unstaking');

  let ramstakedTotal = calcTotalAmount(votes4ramTable, vote_num_in);
  const ramunstakingTotal = calcTotalAmount(votes4ramTable, 'unstaking');
  const rewardTotal = calcTotalAmount(rewardsTable, 'reward');

  return {
    rewardsTable,
    bpsTable: superBpTable
      .sort((bp1, bp2) => bp2.total_staked - bp1.total_staked)
      .map((bp, index) => {
        bp.order = index + 1;
        return bp;
      })
      .concat(
        commonBpTable.sort((bp1, bp2) => bp2.total_staked - bp1.total_staked).map((bp, index) => {
          bp.order = index + 24;
          return bp;
        })
      ),
    bpInfo,
    votesTable,
    votes4ramTable,
    stakedTotal,
    unstakingTotal,
    ramstakedTotal,
    ramunstakingTotal,
    rewardTotal,
    version
  };
};

// available, stakedTotal, unstakingTotal, rewardTotal
export const count_asset_total = (...args) => {
  return calcTotalAmount([...args]);
}

export const getAccountInfo = httpEndpoint => async ({accountName, current_node, votesTable, votes4ramTable, bpsTable, superBpsAmountTable, vote_num_in = 'staked'}) => {
  const [available, account_base_info, locked_eosc] = await Promise.all([getAvailable(httpEndpoint)(accountName), getAccount(httpEndpoint)(accountName), getLockedEosc(httpEndpoint)(accountName)]);
  const reward_res = await getRewardsAndBpsTable(httpEndpoint)(accountName, current_node, concel_container = {cancel: []}, votesTable, votes4ramTable, bpsTable, superBpsAmountTable);
  bpsTable = reward_res.bpsTable;
  votesTable = reward_res.votesTable;
  votes4ramTable = reward_res.votes4ramTable;
  const {rewardsTable, bpInfo} = reward_res;
  const stakedTotal = calcTotalAmount(votesTable, vote_num_in);
  const unstakingTotal = calcTotalAmount(votesTable, 'unstaking');
  const rewardTotal = calcTotalAmount(rewardsTable, 'reward');
  const ramstakedTotal = calcTotalAmount(votes4ramTable, vote_num_in);
  const ramunstakingTotal = calcTotalAmount(votes4ramTable, 'unstaking');
  const assetTotal = calcTotalAmount([available, stakedTotal, unstakingTotal, rewardTotal, ramstakedTotal, ramunstakingTotal]);
  
  const info = {
    assetTotal: toAsset(assetTotal), // 资产总额
    available: toAsset(available), // 可用余额
    stakedTotal: toAsset(stakedTotal), // 投票总额
    unstakingTotal: toAsset(unstakingTotal), // 赎回总额
    rewardTotal: toAsset(rewardTotal), // 待领分红总额
    baseInfo: account_base_info,
    locked_eosc: locked_eosc
  };

  if (bpInfo) {
    info.bpInfo = bpInfo;
  }

  return {
    info,
    bpsTable,
  };

};

const filter_lib_and_auth = (wallet_symbol = 'EOS', name, permission = 'active') => {
  let EOS = wallet_symbol == 'EOS' ? Eos : EOS_ML;
  let auth = wallet_symbol == 'EOS' ? {actor: name, permission} : {authorization: `${name}@${permission}`};
  return {EOS, auth}
}

// 创建用户
export const newAccount = config => async ({creator, accountName, OwnerKey, ActiveKey, permission, wallet_symbol = 'EOS'}) => {
  let auth = {
    actor: creator,
    permission
  }
  let EOS = wallet_symbol == 'EOS' ? Eos : EOS_ML;
  let result = await EOS(config).newaccount(creator, accountName, OwnerKey, ActiveKey, auth).catch(err => {
      return handleApiError(err);
    });
  return result;
};

// transfer
export const transfer = config => async ({ from, to, amount, memo = '', tokenSymbol = 'EOST', precision = '4', permission, wallet_symbol = 'EOS' } = {}) => {
    let {EOS, auth} = filter_lib_and_auth(wallet_symbol, from, permission);
    let contract_name = wallet_symbol == 'EOS' && tokenSymbol == 'EOS' ? 'eosio' : 'eosio.token';
    let token = await EOS(config).contract(contract_name).catch(err => handleApiError(err) );
    amount = toAsset(amount, tokenSymbol, {precision});
    let res = await token.transfer(from, to, amount, memo, auth).catch(err => handleApiError(err) );
    return res;
};

export const vote = config => async ({voter, bpname, amount, permission, wallet_symbol = 'EOS'} = {}) => {
    let {EOS, auth} = filter_lib_and_auth(wallet_symbol, voter, permission);
    let token = await EOS(config).contract('eosio');
    return token.vote(voter, bpname, toAsset(amount, wallet_symbol), auth)
            .catch(err => {
              return handleApiError(err);
            });
};

export const delegatebw = config => async ({from, to, net_quantity, cpu_quantity, release_to_to = 0, permission, wallet_symbol = 'EOS'}) => {
  let {EOS, auth} = filter_lib_and_auth(wallet_symbol, from, permission);
  let token = await EOS(config).contract('eosio');
  let result = await token.delegatebw(from, to, net_quantity, cpu_quantity, release_to_to).catch(err => {
    let error_ob = null;

    try {
          error_ob = JSON.parse(err);
    } catch (e) {};

    return {
      is_error: true,
      message: get_error_msg(error_ob)
    }
  });
  return result;
}
export const unfreeze = config => {
  return async ({ voter, bpname, permission } = {}) => {
    let auth = {
      actor: voter,
      permission
    }
    let token = await Eos(config).contract('eosio');
    return token
      .unfreeze(voter, bpname, auth)
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const freeze = config => async ({ voter, ammount, permission, wallet_symbol = 'EOS' } = {}) => {
  let {EOS, auth} = filter_lib_and_auth(wallet_symbol, voter, permission);
  let token = await EOS(config).contract('eosio');
  let res = await token.freeze(voter, toAsset(ammount, wallet_symbol));
  return res;
};

export const claim = config => {
  return async ({ voter, bpname, permission, wallet_symbol = 'EOS' } = {}) => {
    let {EOS, auth} = filter_lib_and_auth(wallet_symbol, voter, permission);
    let token = await EOS(config).contract('eosio');
    return token
      .claim(voter, bpname, auth)
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const vote4ram = async (config, {voter, bpname, amount, permission, wallet_symbol = 'EOS'}) => {
  let {EOS, auth} = filter_lib_and_auth(wallet_symbol, voter, permission);
  let token = await EOS(config).contract('eosio');
  let res = await token.vote4ram(voter, bpname, toAsset(amount, wallet_symbol), auth)
                  .catch(err => { 
                    throw err;
                   });
  return res;
};

export const unfreeze4ram = async (config, { voter, bpname, permission }) => {
    let auth = {
      actor: voter,
      permission
    };
    let token = await Eos(config).contract('eosio');
    let res = await token.unfreezeram(voter, bpname, auth)
                    .catch(err => { 
                        handleApiError(err);
                        try{
                          err = JSON.parse(err);
                        }catch(e){}
                        return {
                          is_error: true,
                          msg: err
                        }
                     })
                    .then(res => res);
    return res;
};

export const transfer_account = config => async ({name, owner_public_key, active_public_key, permissions, wallet_symbol = 'EOS'}) => {
  let res = {
    is_error: false,
    msg: '',
    data: []
  };
  let {EOS, auth} = filter_lib_and_auth(wallet_symbol, name, 'owner');
  let token = await EOS(config).contract('eosio');
  let action_res = await token.transaction('eosio', tr => {
    tr.updateauth(name, 'active', 'owner', active_public_key, auth);
    tr.updateauth(name, 'owner', '', owner_public_key, auth);
  })
  .catch(err => {
    let error_ob = null;
    try {
          error_ob = JSON.parse(err);
    } catch (e) {};
    return error_ob;
  });

  res.message = get_error_msg(action_res);
  if(res.message){
    res.is_error = true;
    return res;
  }
  return res;
};

export const create_token = config => async ({issuer, maximum_supply}) => {
  let res = await Eos(config)
      .create(issuer, maximum_supply, 'owner')
      .then(res => {
        return res;
      })
      .catch(err => {
        let error_ob = null;
        try {
          error_ob = JSON.parse(err);
        } catch (e) {};
        return null;
      });
}

export const issue_token = config => async ({to, quantity, memo}) => {
  let res = await Eos(config).issue(to, quantity, memo, 'owner');
  return res;
}

/*
  test_multi_action
*/

const test_config = {
  httpEndpoint: 'http://192.168.2.139:8877',
  keyProvider: '',
  chainId: '8c755999b47be35914771c4c3df7dfe12f9412f5e4bb7807a2c1ae8776086a8d',
};
const test_account_name = 'abcd';
const test_multi_action = async () => {
  let eos = await EOS_ML(test_config).contract('eosio.token');
  await eos.transfer(test_account_name, 'abc', '300.0000 EOST', 'hello');
  await eos.transfer(test_account_name, 'abcd', '300.0000 EOST', 'hello');
  await eos.transfer(test_account_name, 'abcde', '300.0000 EOST', 'hello');
  await eos.transfer(test_account_name, 'bdbdbdbdbd', '300.0000 EOST', 'hello');
  await eos.transfer(test_account_name, 'zzz', '300.0000 EOST', 'hello');
}
// test_multi_action();

const test_new_account = async () => {
  let eos = await EOS_ML(test_config).contract('eosio');
  let auth = {
              accounts : [],
              keys : [{key: "EOS5E711ynubMqZeqphqUrbfig36QVgqtbo5uJjVZkA5VTU4Cz5sA", weight: 1}],
              threshold : 1,
              waits : []
            }
  let res = await eos.newaccount(test_account_name, 'z2', '5qYfFGE7k95SEbLdxjmuNUhvcbXifAgmMVusooRDwugvWk89w5', '5qYfFGE7k95SEbLdxjmuNUhvcbXifAgmMVusooRDwugvWk89w5', {'actor': 'zhi', permission: 'owner'})
  console.log(res);
}
// test_new_account();

const test_update_permission = async () => {
  let eos = await EOS_ML(test_config).contract('eosio');
  let auth = {
              accounts : [],
              keys : [{key: "EOST5qYfFGE7k95SEbLdxjmuNUhvcbXifAgmMVusooRDwugvWk89w5", weight: 1}],
              threshold : 1,
              waits : []
            }
  let res = await eos.updateauth(test_account_name, 'active', 'owner', '5E711ynubMqZeqphqUrbfig36QVgqtbo5uJjVZkA5VTU4Cz5sA', {authorization: `${test_account_name}@owner`})
  console.log( res );
}
// test_update_permission()

const test_vote = async () => {
  let eos = await EOS_ML(test_config).contract('eosio');
  // let res = await eos.freeze(test_account_name, '100.0000 EOST');
  // let vote_res = await eos.vote(test_account_name, 'sbp.a', '10.0000 EOST');
  // console.log( vote_res );
  let freeze_res = await EOS_ML(test_config).getTableRows({
    // { 
      scope: 'eosio',
      code: 'eosio',
      table: 'freezed',
      json: true,
      limit: 1,
      // table_key: test_account_name
      lower_bound : test_account_name
    // }
    // table: 'freezed'
  });
  console.log(freeze_res);
}
// test_vote();

const test_unfreeze = async () => {
  let eos = await EOS_ML(test_config).contract('eosio');
  await eos.vote(test_account_name, 'sbp.b', '0.0000 EOST');
  await eos.vote(test_account_name, 'sbp.a', '0.0000 EOST');
  let res = await eos.unfreeze(test_account_name);
  console.log(res);
}
// test_unfreeze();

const test_claim = async () => {
  let eos = await EOS_ML(test_config).contract('eosio');
  await eos.claim('abc', 'sbp.b');
}
// test_claim();

const test_delegatebw = async () => {
  let eos = await EOS_ML(test_config).contract('eosio');
  let result = await eos.delegatebw(test_account_name, test_account_name, '10.0000 EOST', '0.0000 EOST', 0);
  console.error(result);
}
// test_delegatebw();

















