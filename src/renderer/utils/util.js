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
    let details = err.error.details || [];
    let details_msg = [details.map(item => item.message)].join(',')
    return details_msg || err.error.name;
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
export const randomKey = async () => {
    return await ecc.randomKey();
};

// 私钥转公钥
export const privateToPublic = (private_key, symbol = 'EOS') => {
    let public_key = ecc.privateToPublic(private_key);
    return public_key.replace(/^EOS/, symbol);
}

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

export const is_float = (str = '') => {
    let res = parseFloat(str);
    if(isNaN(res)) return false;
    return true;
}

export const is_int = (str = '') => {
    let num = str * 1;
    if(isNaN(num)) return false;
    if( num - parseInt(num) > 0 ) return false;
    return true;
}

export const get_node_version_num = (version_str) => {
    let res = '';
    var t = version_str.split('-');
    t = t.slice(0, 2).join('.');
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
    let block_token = 2.7;
    const n1 = !by_vote_owen ? (block_token * 20 * 60 * 24 * 365) / 23 : block_token * 20 * 60 * 24 * 365 * vote_own_percent * 0.7;
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
            account: act.account,
            seq: tr.global_action_seq,
            time: tr.block_time,
            name: act.name,
            from: act.authorization && act.authorization[0] && act.authorization[0].actor,
            change: act.data.stake,
            status: checkStatus(tr.status),
            block_num: tr.block_num,
            status: tr.status,
            trx_id: tr.action_trace.trx_id
        };
    };
    return ({
        newaccount: tr => {
            const act = tr.action_trace.act;
            return {
                account: act.account,
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
                account: act.account,
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
                account: act.account,
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
                account: act.account,
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
                account: act.account,
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
                account: act.account,
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
    } [trName] || defaultFunc);
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
    try {
        buf = new Buffer(data, 'hex');
        buf_res = Fcbuffer.fromBuffer(eos_base_struct[action_name], buf)
    } catch (e) {
        return;
    }
    return buf_res;
}

export const get_involved_users_form_block = block => {
    let involved_users = new Set();
    let involved_action_dict = {};
    block.transactions.forEach(tr => {
        tr.trx.transaction.actions.forEach(action_item => {
            let pushed_data = typeof action_item.data === 'string' ? abi_bin_to_json(action_item.hex_data || action_item.data, action_item.name) : action_item.data;
            involved_action_dict[action_item.name] = involved_action_dict[action_item.name] || new Set();
            let _keys = ['voter', 'bpname', 'from', 'to', 'auth', 'creator'];
            for (let _key of _keys) {
                if (!pushed_data) {
                  continue ;
                }
                let _u = pushed_data[_key];
                if (_u) {
                    if (_key == 'auth') {
                        involved_users.add(pushed_data.account);
                        _u.keys.map(item => item.key).forEach(item => {
                            involved_users.add(item);
                            involved_action_dict[action_item.name].add(item);
                        });
                    } else if (_key == 'creator') {
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

                    } else {
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
    let involved_users = new Set(),
        involved_action_dict = {};
    item_involved_users.forEach(item => {
        for (let i of item[0]) {
            involved_users.add(i);
        }
        for (let i in item[1]) {
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
    var n = 0,
        n_arr = [];
    for (let i of num_arr.reverse()) {
        if (!(n % 3) && n) { n_arr.push(','); }
        n_arr.push(i);
        n++;
    };
    return n_arr.reverse().join('') + (float_num ? '.' + float_num : '');
}

// eos 格式 转化为 eosc
/*
  params:
    amount_with_symblo : str or number
    pre_symblo : str
    change_to_symblo : str
*/
export const symblo_change = (amount_with_symblo, pre_symblo = 'EOS', change_to_symblo = 'EOSC') => {
    if (!amount_with_symblo) return '';
    amount_with_symblo = amount_with_symblo + '';
    amount_with_symblo = amount_with_symblo.replace(/^\s+|\s+$/, '');
    if (amount_with_symblo == '') return amount_with_symblo;
    let [num, current_symblo] = amount_with_symblo.split(/\s+/g);
    if (isNaN(parseInt(num)) && !current_symblo) {
        current_symblo = num;
    }
    current_symblo = current_symblo || '';
    current_symblo = current_symblo.toLocaleUpperCase();
    pre_symblo = pre_symblo.toLocaleUpperCase();
    if (current_symblo && current_symblo != pre_symblo) return amount_with_symblo;
    if (!current_symblo) {
        return amount_with_symblo + ' ' + change_to_symblo;
    }
    amount_with_symblo = amount_with_symblo.toLocaleUpperCase().replace(pre_symblo, change_to_symblo);
    return amount_with_symblo;
}

function l(e) { 
  "0" === e[0] && "x" === e[1] && (e = e.slice(2)); 
  for (var t = [], n = e.length - 2; n > -1; n -= 2) { 
    t.push(e.substr(n, 2)); 
  } 
  return t.join(""); 
}

export const square_num = (num, times) => {
  let n = new Array(times);
  let y = new BigNumber(num);
  for(let i of n.keys()){
    y = y.times(num);
  }
  return y;
}
const char_to_symbol = (c) => {
    let code_c = (c + '').charCodeAt(),
        code_a = 'a'.charCodeAt(),
        code_z = 'z'.charCodeAt(),
        code_1 = '1'.charCodeAt(),
        code_5 = '5'.charCodeAt(),
        res = 0;
    if( code_c >= code_a && code_c <= code_z )
         res = (code_c - code_a) + 6;
    if( code_c >= code_1 && code_c <= code_5 )
         res = (code_c - code_1) + 1;
    return res
}
var get_max_pos = (ten_num) => {
    let p_n = new Array(64), res = -1;
    for (let i of p_n.keys()) {
        p_n[i] = 2 ** i;
    }
    for (let _index of p_n.keys()) {
        if (ten_num >= p_n[_index] && ten_num < p_n[_index + 1]) {
            res = _index;
            break ;
        }
    }
    return res;
}
var ten_to_bit = (ten_num) => {
    let p_n = new Array(64), res = new Array(64);
    for (let i of p_n.keys()) {
        p_n[i] = 2 ** i;
        res[i] = 0;
    }
    while (ten_num > 0) {
        let pos = get_max_pos(ten_num);
        ten_num -= 2 ** pos;
        res[pos] = 1;
    }
    return res;
}
const move_bite = (bit_num, move_pos) => {
    let new_zero_array = new Array(move_pos);
    for(let _index of new_zero_array.keys()) { new_zero_array[_index] = 0 };
    bit_num.splice(0, 0, ...new_zero_array);
    return bit_num;
}
const or_bits = (bit_num_from, bit_num_to) => {
    let total = new BigNumber(0);
    for (let _i of bit_num_from.keys()) {
        if (bit_num_from[_i] || bit_num_to[_i]) {
            bit_num_from[_i] = 1;
        }else{
            bit_num_from[_i] = 0;
        }
    }
    return bit_num_from;
}
const bits_to_ten = (bit_num) => {
    let total = new BigNumber(0), keys = bit_num.keys();
    for(let item of keys){
        if ( bit_num[item] ) {
            total = total.plus(square_num(2, item))
        }
    }
    return total;
}
// 数字账户转换为查询时需要的数字
export const string_to_name = ( _str ) => {
    let int_num = parseInt(_str);
    if (!int_num || ('' + int_num ).length != (_str + '').length) {
        return _str;
    }
    let name = new Array(64);
    for(let _i of name.keys()) { name[_i] = 0 };
    let i = 0;
    for ( i ; _str[i] && i < 12; ++i) {
       let symbol = ten_to_bit((char_to_symbol(_str[i]) & 0x1f )),
       pos = 64 - 5 * (i + 1) - 1;
       let moved_bites = move_bite(symbol, pos);
       or_bits(name, moved_bites);
   }
   if (i == 12){
      or_bits(name, ten_to_bit((char_to_symbol(_str[12]) & 0x1f )));
   }
   return bits_to_ten(name).toString();
}

export const wait_time = (_time = 3000) => {
    return new Promise((rs, rj) => {
        let t = setTimeout(() => {
            clearTimeout(t);
            rs();
        }, _time);
    });
}

export const complete_num_with_zero = (num) => {
  if(num < 10) return `0${num}`;
  return num;
}


export const calcute_fixed_reward = (data, head_block_num, bpsTable) => {
  data.rows.forEach(row => {
    row.latest_block_num = row.withdraw_block_num - head_block_num;

    // calculate my reward
    const myVoteage = calcVoteage([row.votepower_age.age, row.votepower_age.staked, head_block_num, row.votepower_age.update_height]);
    row.myVoteage = myVoteage;

    let bp_item = bpsTable.find(i => i.name == row.bpname);
    const reward = calcReward([myVoteage, bp_item.bpVoteage, bp_item.rewards_pool]);
    row.reward = reward;
    row.rewards_pool = bp_item.rewards_pool;

    if(row.latest_block_num >= 0){
      let finish_time = new Date( row.latest_block_num * 3 * 1000 + new Date().getTime() );
      let year    = complete_num_with_zero(finish_time.getFullYear()),
          month   = complete_num_with_zero(finish_time.getMonth() + 1),
          date    = complete_num_with_zero(finish_time.getDate()),
          hours   = complete_num_with_zero(finish_time.getHours()),
          minutes = complete_num_with_zero(finish_time.getMinutes()),
          seconds = complete_num_with_zero(finish_time.getSeconds());

      row.finish_time = `${ year }-${ month }-${ date } ${ hours }:${ minutes }:${ seconds }`;

    }else{
      row.finish_time = -1
    }
  });
}
