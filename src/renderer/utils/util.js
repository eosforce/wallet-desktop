import Eos from 'eosjs';
import sjcl from 'sjcl';
import BigNumber from 'bignumber.js';

const { ecc } = Eos.modules;

// 错误处理

export const handleApiError = err => {
  return new Promise((resolve, reject) => {
    try {
      const json = JSON.parse(err);
      const error = json.error;
      const apiError = new Error(json.error.details[0].message);
      apiError.code = error.code;
      reject(apiError);
    } catch (e) {
      reject(err);
    }
  });
};

// 计算最新票龄
// 票龄 + 投票金额 * （当前高度 - 票龄更新高度）
export const calcVoteage = args => {
  const [voteage, staked, currentHeight, updateHeight] = args.map(toBigNumber);
  return voteage.plus(staked.multipliedBy(currentHeight.minus(updateHeight)));
};

// 计算分红
export const calcReward = args => {
  const [myVoteage, bpVoteage, rewardsPool] = args.map(toBigNumber);
  if (!bpVoteage.isZero()) {
    return myVoteage.multipliedBy(rewardsPool).dividedBy(bpVoteage);
  } else {
    return toBigNumber(0);
  }
};

// 返回随机私钥
export const randomKey = (...args) => ecc.randomKey(...args);

// 私钥转公钥
export const privateToPublic = (...args) => ecc.privateToPublic(...args);

// 加密
export const encrypt = (key, data) => {
  if (typeof data === 'object') data = JSON.stringify(data);
  const { iv, salt, ct } = JSON.parse(sjcl.encrypt(key, data, { mode: 'gcm' }));
  return JSON.stringify({ iv, salt, ct });
};

// 解密
export const decrypt = (key, encryptedData) => {
  encryptedData = JSON.stringify(Object.assign(JSON.parse(encryptedData), { mode: 'gcm' }));
  let clear = sjcl.decrypt(key, encryptedData);
  return JSON.parse(clear);
};

export const getTimeStamp = date => {
  const hackDate = new Date().toISOString().split('.')[0];
  const dateObj = date ? new Date(date) : new Date(hackDate);
  return (+dateObj / 1000) | 0;
};

export const isZero = (str = '') => {
  return /^0[0.]*$/.test(String(str));
};

// 'XXX EOS或 XXX 转化为 bignumber 格式'
export const toBigNumber = asset => {
  if (BigNumber.isBigNumber(asset)) {
    return asset;
  } else if (isNaN(asset)) {
    if (!asset) return new BigNumber('0');
    const match = asset.match(/^([0-9.]+) EOS$/);
    const amount = match ? match[1] : '0';
    return new BigNumber(amount);
  } else {
    return new BigNumber(asset);
  }
};

export const toNumber = value => {
  if (!value) return 0;
  if (BigNumber.isBigNumber(value)) {
    return value.toNumber();
  }
  if (!isNaN(value)) {
    return Number(value);
  }
  if (isNaN(value) && typeof value === 'string' && /^[0-9.-]+\s([A-Z]+)$/.test(value)) {
    return Number(value.split(' ')[0]);
  }
  return value;
};

// '字符串或数字或 bignumber 格式转化为 XXX EOS 格式'
export const toAsset = (_amount, symbol = 'EOS', { precision = '4' } = {}) => {
  const amount = toBigNumber(_amount).toFixed(Number(precision));
  return [amount, symbol].join(' ');
};

// 累加金额，返回 BigNumber
export const calcTotalAmount = (rows = [], key) => {
  return rows.reduce((result, row) => {
    const value = toBigNumber(key ? row[key] : row);
    return result.plus(value);
  }, new BigNumber('0'));
};

// 计算是否有投票和分红和赎回金
export const calcVoteExist = (meVoteage, reward, unstaking) => {
  return !(toBigNumber(meVoteage).isZero() && toBigNumber(reward).isZero() && toBigNumber(unstaking).isZero());
};

// 计算年化利率
export const calcApr = (totalStaked, commissionRate) => {
  if (!totalStaked) return 0;
  const n1 = (9 * 20 * 60 * 24 * 365) / 23;
  return (n1 * (1 - commissionRate / 10000)) / totalStaked;
};

// 是否是 object
export const isObject = val => val != null && typeof val === 'object';

export const decryptWif = (password, data) => {
  try {
    const wif = decrypt(password, data).privateKey;
    return Promise.resolve(wif);
  } catch (err) {
    return Promise.reject(new Error('密码错误'));
  }
};

export const genTrConvertFunc = trName => {
  const defaultFunc = tr => {
    const act = tr.action_trace.act;
    return {
      seq: tr.global_action_seq,
      time: tr.block_time,
      name: act.name,
      from: act.authorization && act.authorization[0] && act.authorization[0].actor,
      status: checkStatus(tr.status),
    };
  };
  return (
    {
      newaccount: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '创建用户',
          from: act.authorization && act.authorization[0] && act.authorization[0].actor,
          status: checkStatus(tr.status),
        };
      },
      vote: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '投票',
          from: act.data.voter,
          to: act.data.bpname,
          change: act.data.stake,
          status: checkStatus(tr.status),
        };
      },
      transfer: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '转账',
          from: act.data.from,
          to: act.data.to,
          change: act.data.quantity,
          memo: act.data.memo,
          status: checkStatus(tr.status),
        };
      },
      claim: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '提取分红',
          from: act.data.voter,
          to: act.data.bpname,
          status: checkStatus(tr.status),
        };
      },
      unfreeze: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '解冻',
          from: act.data.voter,
          to: act.data.bpname,
          status: checkStatus(tr.status),
        };
      },
    }[trName] || defaultFunc
  );
};

var checkStatus = status => {
  switch (status) {
    case 'executed':
      return '已执行';
    default:
      return status;
  }
};

export const exportWif = (password, data) => {
  try {
    const wif = decrypt(password, data).privateKey;
    return Promise.resolve(wif);
  } catch (err) {
    return Promise.reject(new Error('密码错误'));
  }
};

export const getToken = asset => {
  return asset && asset.split(' ')[1];
};
