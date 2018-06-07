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
  return /^0[0\.]*$/.test(String(str));
};

// 'XXX EOS或 XXX 转化为 bignumber 格式'
export const toBigNumber = asset => {
  if (BigNumber.isBigNumber(asset)) {
    return asset;
  } else if (isNaN(asset)) {
    if (!asset) return new BigNumber('0');
    const match = asset.match(/^([0-9\.]+) EOS$/);
    const amount = match ? match[1] : '0';
    return new BigNumber(amount);
  } else {
    return new BigNumber(asset);
  }
};

// '字符串或数字或 bignumber 格式转化为 XXX EOS 格式'
export const toAsset = _amount => {
  const amount = toBigNumber(_amount).toFixed(4);
  return [amount, 'EOS'].join(' ');
};

// 累加金额，返回 BigNumber
export const calcTotalAmount = (rows = [], key) => {
  return rows.reduce((result, row) => {
    const value = toBigNumber(key ? row[key] : row);
    return result.plus(value);
  }, new BigNumber('0'));
};

// 计算分红
export const clacReward = (me_voteage, bp_voteage, rewards_pool) => {
  const meVoteageAmount = toBigNumber(me_voteage);
  const bpVoteageAmount = toBigNumber(bp_voteage);
  const rewardsPoolAmount = toBigNumber(rewards_pool);
  if (!bpVoteageAmount.isZero()) {
    return meVoteageAmount.multipliedBy(rewardsPoolAmount).dividedBy(bpVoteageAmount);
  } else {
    return toBigNumber(0);
  }
};

// 计算票龄
export const calcVoteage = (voteage, staked, voteage_update_time) => {
  const stakedAmount = toBigNumber(staked);
  const voteageAmount = toBigNumber(voteage);
  const voteageUpdateTimestamp = toBigNumber(getTimeStamp(voteage_update_time));
  const nowTimestamp = toBigNumber(getTimeStamp());
  const time = nowTimestamp.minus(voteageUpdateTimestamp);
  return voteageAmount.plus(time.multipliedBy(stakedAmount));
};

// 计算是否有投票和分红和赎回金
export const calcVoteExist = (me_voteage, reward, unstaking) => {
  return !(toBigNumber(me_voteage).isZero() && toBigNumber(reward).isZero() && toBigNumber(unstaking).isZero());
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
  return decrypt(password, data).privateKey;
};

export const genTrConvertFunc = trName => {
  const defaultFunc = tr => {
    const act = tr.action_trace.act;
    return {
      seq: tr.global_action_seq,
      time: tr.block_time,
      name: act.name,
      from: act.authorization && act.authorization[0] && act.authorization[0].actor,
      status:checkStatus(tr.status),
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
          status:checkStatus(tr.status),
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
          change: act.data.change,
          status:checkStatus(tr.status),
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
          status:checkStatus(tr.status),
        };
      },
      claim: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '提取分红',
          from: act.data.bpname,
          to: act.data.voter,
          status:checkStatus(tr.status),
        };
      },
      unfreeze: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '解冻',
          from: act.data.bpname,
          to: act.data.voter,
          status:checkStatus(tr.status),
        };
      },
    }[trName] || defaultFunc
  );
};

var checkStatus = status => {
  switch(status){
      case "executed" : return "已执行";break;
      //case "": return "";break;
      //case "": return "";break;
      //case "": return "";break;
      default : return status;
  }
}
