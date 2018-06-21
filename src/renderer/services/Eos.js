import Eos from 'eosjs';

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
} from '@/utils/util';

export const getNodeList = () => {
  const map = {
    '1.0': NODE_API_URL,
    // '0.7': NODE_TEST_NET_URL,
  };
  return fetch(map[Store.state.app.chainNet], {
    headers: {
      Accept: 'application/vnd.github.raw+json',
    },
  }).then(res => res.json());
};

// 获取节点信息
export const getNodeInfo = httpEndpoint => {
  return Eos({ httpEndpoint }).getInfo({});
};

// 查询块信息
export const getBlock = httpEndpoint => block_num_or_id => {
  return Eos({ httpEndpoint }).getBlock({ block_num_or_id });
};

// 根据公钥获取用户名数组
export const getAccounts = httpEndpoint => publicKey => {
  return Eos({ httpEndpoint })
    .getKeyAccounts({ public_key: publicKey })
    .then(result => {
      return result.account_names || [];
    });
};

// 获取交易记录
export const getTransferRecord = httpEndpoint => ({ accountName, pos, offset }) => {
  return Eos({ httpEndpoint }).getActions({ account_name: accountName, pos: pos, offset: offset, limit: 100 });
};

// 获取交易详情
export const getTransAction = httpEndpoint => ({ tid }) => {
  var act = Eos({ httpEndpoint }).getTransaction({ id: tid });
  return act;
};

// 从节点创建用户
export const newAccountFromNode = httpEndpoint => ({ accountName, publicKey }) => {
  return Eos({ httpEndpoint })
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
  return Eos(config)
    .newaccount(creator, accountName, publicKey, publicKey)
    .catch(err => {
      return handleApiError(err);
    });
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

// 获取指定账户可用余额
export const getAvailable = httpEndpoint => accountName => {
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
        return toBigNumber(account.available);
      } else {
        return toBigNumber(0);
      }
    });
};

// 获取 token list
export const getTokenList = httpEndpoint => accountName => {
  return Eos({ httpEndpoint })
    .getTableRows({ scope: accountName, code: 'eosio.token', table: 'accounts', json: true, limit: 1000 })
    .then(data => {
      if (data.rows.length) {
        return Promise.all(
          data.rows.map(row => {
            const balance = row.balance;
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
                return {
                  symbol,
                  precision,
                  balance,
                  ...result.rows[0],
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
export const getBpsTable = httpEndpoint => () => {
  return Eos({ httpEndpoint })
    .getTableRows({ scope: 'eosio', code: 'eosio', table: 'bps', json: true, limit: 1000 })
    .then(data => data.rows);
};

// 获取 vote 表
export const getVotesTable = httpEndpoint => accountName => {
  return Eos({ httpEndpoint })
    .getTableRows({ scope: accountName, code: 'eosio', table: 'votes', json: true, limit: 1000 })
    .then(data => data.rows);
};

// table
export const getTable = httpEndpoint => params => {
  return Eos({ httpEndpoint }).getTableRows({ ...params, json: true, limit: 1000 });
};

// 根据 bp 和 vote 得到分红表，返回一个对象
export const getRewardsAndBpsTable = httpEndpoint => async (votesTable, accountName) => {
  const bpsTable = await getBpsTable(httpEndpoint)();
  const { head_block_num: currentHeight } = await getNodeInfo(httpEndpoint);
  const { schedule_version } = await getBlock(httpEndpoint)(currentHeight);
  let version;
  const superBpsAmountTable = await getTable(httpEndpoint)({
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

    if (bpRow.name === accountName) {
      bpInfo = {
        bpname: bpRow,
        ...bpRow,
      };
    }

    // 年化利率
    bpRow.adr = calcApr(bpRow.total_staked, bpRow.commission_rate);

    const bpVoteage = calcVoteage([
      bpRow.total_voteage,
      bpRow.total_staked,
      currentHeight,
      bpRow.voteage_update_height,
    ]);
    bpRow.bpVoteage = bpVoteage;

    if (vote) {
      // 我的最新票龄
      const myVoteage = calcVoteage([vote.voteage, vote.staked, currentHeight, vote.voteage_update_height]);
      // 节点最新票龄
      // 我的分红
      const reward = calcReward([myVoteage, bpVoteage, bpRow.rewards_pool]);

      const extraRow = { bpname: vote.bpname, reward, ...vote };

      rewardsTable.push({ ...extraRow });

      bpRow.vote = { ...extraRow };
      bpRow.hasVote = calcVoteExist(vote.staked, vote.reward, vote.unstaking);
    }

    if (bpRow.isSuperBp) {
      superBpTable.push(bpRow);
    } else {
      commonBpTable.push(bpRow);
    }
  }

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
    assetTotal: toAsset(assetTotal), // 资产总额
    available: toAsset(available), // 可用余额
    stakedTotal: toAsset(stakedTotal), // 投票总额
    unstakingTotal: toAsset(unstakingTotal), // 赎回总额
    rewardTotal: toAsset(rewardTotal), // 待领分红总额
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
  return ({ from, to, amount, memo = '', tokenSymbol = 'EOS', precision = '4' } = {}) => {
    return Promise.resolve()
      .then(() => {
        return Eos(config)
          .contract(tokenSymbol === 'EOS' ? 'eosio' : 'eosio.token')
          .then(token => {
            return token.transfer(from, to, toAsset(amount, tokenSymbol, { precision }), memo);
          });
      })
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const vote = config => {
  return ({ voter, bpname, amount } = {}) => {
    return Eos(config)
      .vote(voter, bpname, toAsset(amount))
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const unfreeze = config => {
  return ({ voter, bpname } = {}) => {
    return Eos(config)
      .unfreeze(voter, bpname)
      .catch(err => {
        return handleApiError(err);
      });
  };
};

export const claim = config => {
  return ({ voter, bpname } = {}) => {
    return Eos(config)
      .claim(voter, bpname)
      .catch(err => {
        return handleApiError(err);
      });
  };
};
