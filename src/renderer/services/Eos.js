import Eos from 'eosjs';

import { NODE_API_URL, NODE_TEST_NET_URL } from '@/constants/config.constants';
import Store from '@/store';

import {
  getToken,
  toAsset,
  toBigNumber,
  calcVoteExist,
  calcTotalAmount,
  handleApiError,
  calcVoteage,
  clacReward,
} from '@/utils/util';

export const getNodeList = () => {
  const map = {
    '0.6': NODE_API_URL,
    '0.7': NODE_TEST_NET_URL,
  };
  return fetch(map[Store.state.app.chainNet], {
    headers: {
      Accept: 'application/vnd.github.raw+json',
    },
  }).then(res => res.json());
};

// 获取节点信息
export const getNodeInfo = httpEndpoint => {
  return Eos.Localnet({ httpEndpoint }).getInfo({});
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

// 获取交易详情
export const getTransAction = httpEndpoint => ({ tid }) => {
  var act = Eos.Localnet({ httpEndpoint }).getTransaction({ id: tid });
  return act;
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

// 获取 token list
export const getTokenList = httpEndpoint => accountName => {
  return Eos.Localnet({ httpEndpoint })
    .getTableRows({ scope: accountName, code: 'eosio.token', table: 'accounts', json: true, limit: 1000 })
    .then(data => {
      if (data.rows.length) {
        return Promise.all(
          data.rows.map(row => {
            const balance = row.balance;
            const symbol = getToken(balance);
            return Eos.Localnet({ httpEndpoint })
              .getTableRows({
                scope: symbol,
                code: 'eosio.token',
                table: 'stat',
                json: true,
                limit: 1000,
              })
              .then(result => {
                return {
                  symbol,
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
  return Eos.Localnet({ httpEndpoint })
    .getTableRows({ scope: 'eosio', code: 'eosio', table: 'bps', json: true, limit: 1000 })
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
    .getTableRows({ scope: accountName, code: 'eosio', table: 'votes', json: true, limit: 1000 })
    .then(data => data.rows);
};

// 根据 bp 和 vote 得到分红表，返回一个对象
export const getRewardsAndBpsTable = httpEndpoint => async (votesTable, accountName) => {
  const bpsTable = await getBpsTable(httpEndpoint)();
  const { head_block_num: currentHeight } = await getNodeInfo(httpEndpoint);

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
      const reward = clacReward([myVoteage, bpVoteage, bpRow.rewards_pool]);

      const extraRow = { bpname: vote.bpname, reward, ...vote };

      rewardsTable.push({ ...extraRow });

      bpRow.vote = { ...extraRow };
      bpRow.hasVote = calcVoteExist(vote.staked, vote.reward, vote.unstaking);
      if (bpRow.hasVote) {
        bpsHaveVoteTable.push(bpRow);
      } else {
        bpsNoVoteTable.push(bpRow);
      }
    } else {
      bpsNoVoteTable.push(bpRow);
    }
  }

  return {
    rewardsTable,
    bpsTable,
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
  return ({ from, to, amount, memo = '', tokenSymbol = 'EOS' } = {}) => {
    Promise.resolve()
      .then(() => {
        if (tokenSymbol === 'EOS') {
          return Eos.Localnet(config).transfer({ from, to, quantity: toAsset(amount, tokenSymbol), memo });
        } else {
          return Eos.Localnet(config)
            .contract('eosio.token')
            .then(token => {
              token.transfer({ from, to, quantity: toAsset(amount, tokenSymbol), memo });
            });
        }
      })
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
