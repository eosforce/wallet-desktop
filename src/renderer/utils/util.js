import Eos from 'eosforce';
import sjcl from 'sjcl';
import BigNumber from 'bignumber.js';
const { ecc, Fcbuffer } = Eos.modules;

export const toUrl = (url = '') => {
  if (url && !url.match(/^(http:\/\/)|(https:\/\/)/)) {
    return 'http://' + url;
  }
  return url;
};
// 提取错误信息，没有错误这换回空
export const get_error_msg = err => {
  if (!err.error) return '';
  let msg = err.error.details.map(item => item.message)
  return msg.join('.');
}

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

export const get_node_version_num = (version_str) => {
  let res = '';
  var t = version_str.split('-'); 
  t = t.slice(0, t.length - 1).join('.');
  t.replace('v', '').split('.').forEach((o, i) => {
    res += o * (10 ** (5 - i));
  });
  return res;
}
// 'XXX EOS或 XXX 转化为 bignumber 格式'
export const toBigNumber = (asset, symbol = '') => {
  if (BigNumber.isBigNumber(asset)) {
    return asset;
  } else if (isNaN(asset)) {
    if (!asset) return new BigNumber('0');
    const match = asset.split(' ');
    const amount = match ? match[0] : '0';
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
/*
  vote_own_percent 投票占比
*/
export const calcApr = (totalStaked, commissionRate, vote_own_percent = 0, by_vote_owen = false) => {
  if (!totalStaked) return 0;
  const n1 = !by_vote_owen ? (9 * 20 * 60 * 24 * 365) / 23 :  9 * 20 * 60 * 24 * 365 * vote_own_percent * 0.7;
  // console.log( n1, 'n1');
  // const n1 = 9 * 20 * 60 * 24 * 365 * vote_own_percent * 0.7;
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

export const genTrConvertFunc = (trName, last_irreversible_block_num) => {
  const defaultFunc = tr => {
    const act = tr.action_trace.act;
    return {
      seq: tr.global_action_seq,
      time: tr.block_time,
      name: act.name,
      from: act.authorization && act.authorization[0] && act.authorization[0].actor,
      status: checkStatus(tr.status),
      block_num: tr.block_num,
      status: tr.status,
      trx_id: tr.action_trace.trx_id
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
          block_num: tr.block_num,
          status: tr.status,
          trx_id: tr.action_trace.trx_id
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
          block_num: tr.block_num,
          status: tr.status,
          trx_id: tr.action_trace.trx_id
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
          block_num: tr.block_num,
          status: tr.status,
          trx_id: tr.action_trace.trx_id
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
          block_num: tr.block_num,
          status: tr.status,
          trx_id: tr.action_trace.trx_id
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
          block_num: tr.block_num,
          status: tr.status,
          trx_id: tr.action_trace.trx_id
        };
      },
      updateauth: tr => {
        const act = tr.action_trace.act;
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '权限转让',
          from: act.authorization && act.authorization[0] && act.authorization[0].actor,
          to: act.data.bpname,
          status: checkStatus(tr.status),
          block_num: tr.block_num,
          status: tr.status,
          trx_id: tr.action_trace.trx_id
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

const eos_base_struct = Eos().fc.structs;
export const abi_bin_to_json = (data, action_name) => {
    let buf, buf_res;
    let start_time = new Date().getTime();
    try{
        buf = new Buffer(data, 'hex');
        buf_res = Fcbuffer.fromBuffer(eos_base_struct[action_name], buf)
    }catch(e){
        return ;
    }
    return buf_res;
}

export const get_involved_users_form_block = block => {
  let involved_users = new Set();
  let involved_action_dict = {};
  block.transactions.forEach(tr => {
     tr.trx.transaction.actions.forEach(action_item => {
      let pushed_data = abi_bin_to_json(action_item.hex_data || action_item.data, action_item.name);
      involved_action_dict[action_item.name] = involved_action_dict[action_item.name] || new Set();
      let _keys = ['voter', 'bpname', 'from', 'to', 'auth', 'creator'];
      for(let _key of _keys){
        let _u = pushed_data[_key];
        if(_u){
          if(_key == 'auth'){
            involved_users.add(pushed_data.account);
            _u.keys.map(item => item.key).forEach(item => {
              involved_users.add(item);
              involved_action_dict[action_item.name].add(item);
            });
          }else if(_key == 'creator'){
            // new_account
            involved_users.add(_u);
            pushed_data.active.keys.map(item => item.key).forEach(item => {
              involved_users.add(item);
              involved_action_dict[action_item.name].add(item);
            });
            pushed_data.owner.keys.map(item => item.key).forEach(item => {
              involved_users.add(item);
              involved_action_dict[action_item.name].add(item);
            });
            
          }else{
            involved_users.add(_u);
            involved_action_dict[action_item.name].add(_u);
          }
        }
      }
     });
  });
  involved_users.delete(false);
  return [involved_users, involved_action_dict];
}

export const get_involved_users_form_blocks = blocks => {
  let item_involved_users = blocks.map(item => get_involved_users_form_block(item));
  let involved_users = new Set(), involved_action_dict = {};
  item_involved_users.forEach(item => {
    for(let i of item[0]){
      involved_users.add(i);
    }
    for(let i in item[1]){
      involved_action_dict[i] = involved_action_dict[i] || new Set();
      [...item[1][i]].map(item => involved_action_dict[i].add(item));
    }
  });
  return [involved_users, involved_action_dict];
}

export const split_long_num = (num) => {
    let num_str = num + '';
    let [int_num, float_num = ''] = num_str.split('.');
    var num_arr = int_num.split('');
    var n = 0, n_arr = []; 
    for(let i of num_arr.reverse()){
        if(!(n%3) && n){n_arr.push(',');}
        n_arr.push(i);
        n ++;
    };
    return n_arr.reverse().join('') + (float_num ? '.' + float_num : '');
}