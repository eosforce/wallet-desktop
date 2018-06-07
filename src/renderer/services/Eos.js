import Eos from 'eosjs';

import { NODE_API_URL } from '@/constants/config.constants';
import {
  toAsset,
  toBigNumber,
  calcVoteExist,
  calcTotalAmount,
  clacReward,
  handleApiError,
  calcVoteage,
} from '@/utils/util';

export const getNodeList = () => {
  return Promise.resolve([
    {
      node_name: 'ali1',
      location: '上海',
      node_addr: '47.98.151.194',
      port_http: '8888',
      port_ssl: '',
      port_p2p: '9876',
    },
    {
      node_name: 'ali2',
      location: '北京',
      node_addr: '47.98.149.73',
      port_http: '8888',
      port_ssl: '',
      port_p2p: '9876',
    },
    {
      node_name: 'test1',
      location: '日本',
      node_addr: 'testnet1.bp.eosforce.io',
      port_http: '8888',
      port_ssl: '',
      port_p2p: '9876',
    },
    {
      node_name: 'test2',
      location: '日本',
      node_addr: 'testnet2.bp.eosforce.io',
      port_http: '8888',
      port_ssl: '',
      port_p2p: '9876',
    },
    {
      node_name: 'test3',
      location: '日本',
      node_addr: 'testnet3.bp.eosforce.io',
      port_http: '8888',
      port_ssl: '',
      port_p2p: '9876',
    },
    {
      node_name: 'test4',
      location: '日本',
      node_addr: 'testnet4.bp.eosforce.io',
      port_http: '8888',
      port_ssl: '',
      port_p2p: '9876',
    },
  ]);
  // return fetch(NODE_API_URL, {
  //   headers: {
  //     Accept: 'application/vnd.github.raw+json',
  //   },
  // })
  //   .then(res => res.json())
  //   .then(data => {
  //     return data.nodes
  //   })
  //   .catch(err => {
  //     return Promise.reject(new Error('获取节点列表失败！'))
  //   })
};

export const getNodeInfo = httpEndpoint => {
  return Eos.Localnet({ httpEndpoint }).getInfo({});
};

export const createLocalNet = ({ chain_id, http_endpoint }) => config => {
  return Eos.Localnet({ httpEndpoint, chainId: chain_id, ...config });
};

// 根据公钥获取用户名数组
export const getAccounts = httpEndpoint => publicKey => {
  return Eos.Localnet({ httpEndpoint })
    .getKeyAccounts({ public_key: publicKey })
    .then(result => {
      return result.account_names || [];
    });
};

// 获取交易记录
export const getTransferRecord = httpEndpoint => ({ accountName, pos, offset }) => {
  return Eos.Localnet({ httpEndpoint }).getActions({ account_name: accountName, pos: pos, offset: offset, limit: 100 });
};

// 从节点创建用户
export const newAccountFromNode = httpEndpoint => ({ accountName, publicKey }) => {
  return Eos.Localnet({ httpEndpoint })
    .createAccount({
      account: accountName,
      keys: {
        owner: publicKey,
        active: publicKey,
      },
    })
    .catch(err => {
      return handleApiError(err);
    });
};

// 创建用户
export const newAccount = config => ({ creator, accountName, publicKey }) => {
  return Eos.Localnet(config)
    .newaccount({
      creator: creator,
      name: accountName,
      owner: publicKey,
      active: publicKey,
    })
    .catch(err => {
      return handleApiError(err);
    });
};

// 获取指定账户可用余额
export const getAvailable = httpEndpoint => accountName => {
  return Eos.Localnet({ httpEndpoint })
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
        return toBigNumber(account.available);
      } else {
        return toBigNumber(0);
      }
    });
};

// 获取 bp 表
export const getBpsTable = httpEndpoint => () => {
  return Eos.Localnet({ httpEndpoint })
    .getTableRows({ scope: 'eosio', code: 'eosio', table: 'bps', json: true, limit: 1000000 })
    .then(data => data.rows)
    .then(data => {
      return data.sort((val1, val2) => {
        return toBigNumber(val2.total_staked)
          .minus(toBigNumber(val1.total_staked))
          .toNumber();
      });
    });
};

// 获取 vote 表
export const getVotesTable = httpEndpoint => accountName => {
  return Eos.Localnet({ httpEndpoint, chain_id: 'dc85ad2842e7d62c699d952b26fa7abe11fe90c00004b9d6b0eac55a44e3bbe1' })
    .getTableRows({ scope: accountName, code: 'eosio', table: 'votes', json: true, limit: 1000000 })
    .then(data => data.rows);
};

// 根据 bp 和 vote 得到分红表，返回一个对象
export const getRewardsAndBpsTable = httpEndpoint => async (votesTable, accountName) => {
  const bpsTable = await getBpsTable(httpEndpoint)();
  const bpsHaveVoteTable = [];
  const bpsNoVoteTable = [];
  const rewardsTable = [];
  let bpInfo;
  for (const [index, bpRow] of bpsTable.entries()) {
    bpRow.order = index + 1;
    const vote = votesTable.find(row => row.bpname === bpRow.name);
    if (bpRow.name === accountName) {
      bpInfo = {
        bpname: bpRow,
        ...bpRow,
      };
    }

    const { rewards_pool, total_voteage, total_staked, voteage_update_time } = bpRow;
    bpRow.bp_voteage = calcVoteage(total_voteage, total_staked, voteage_update_time);
    if (vote) {
      const { bpname, staked, stake_time, unstaking } = vote;
      const me_voteage = calcVoteage(vote.voteage, vote.staked, vote.voteage_update_time);
      const reward = toAsset(clacReward(me_voteage, bpRow.bp_voteage, rewards_pool));
      const isMyVote = calcVoteExist(staked, reward, unstaking);
      const extraRow = {
        bpname,
        staked,
        unstaking,
        stake_time,
        rewards_pool,
        total_voteage,
        total_staked,
        me_voteage,
        reward,
        isMyVote,
      };
      rewardsTable.push({ ...extraRow });

      bpRow.vote = { ...extraRow };
      if (isMyVote) {
        bpsHaveVoteTable.push(bpRow);
      } else {
        bpsNoVoteTable.push(bpRow);
      }
    } else {
      bpsNoVoteTable.push(bpRow);
    }
  }

  bpsHaveVoteTable.sort((val1, val2) => {
    return toBigNumber(val2.vote.staked)
      .minus(toBigNumber(val1.vote.staked))
      .toNumber();
  });

  return {
    rewardsTable,
    bpsTable: bpsHaveVoteTable.concat(bpsNoVoteTable),
    bpInfo,
  };
};

export const getAccountInfo = httpEndpoint => async accountName => {
  const votesTable = await getVotesTable(httpEndpoint)(accountName);
  const { rewardsTable, bpsTable, bpInfo } = await getRewardsAndBpsTable(httpEndpoint)(votesTable, accountName);

  const available = await getAvailable(httpEndpoint)(accountName);
  const stakedTotal = calcTotalAmount(votesTable, 'staked');
  const unstakingTotal = calcTotalAmount(votesTable, 'unstaking');
  const rewardTotal = calcTotalAmount(rewardsTable, 'reward');
  const assetTotal = calcTotalAmount([available, stakedTotal, unstakingTotal, rewardTotal]);

  const info = {
    assetTotal: toAsset(assetTotal), // 总资产
    available: toAsset(available), // 可用余额
    stakedTotal: toAsset(stakedTotal), // 总投票金额
    unstakingTotal: toAsset(unstakingTotal), // 总赎回金额
    rewardTotal: toAsset(rewardTotal), // 总待领取分红
  };

  if (bpInfo) {
    info.bpInfo = bpInfo;
  }

  return {
    info,
    bpsTable,
  };
};

export const transfer = config => {
  return ({ from, to, amount } = {}) => {
    return Eos.Localnet(config)
      .transfer({ from, to, quantity: toAsset(amount), memo: '' })
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const vote = config => {
  return ({ voter, bpname, amount } = {}) => {
    return Eos.Localnet(config)
      .vote({ voter, bpname, stake: toAsset(amount) })
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const unfreeze = config => {
  return ({ voter, bpname } = {}) => {
    return Eos.Localnet(config)
      .unfreeze({ voter, bpname })
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const claim = config => {
  return ({ voter, bpname } = {}) => {
    return Eos.Localnet(config)
      .claim({ voter, bpname })
      .catch(err => {
        return handleApiError(err);
      });
  };
};
