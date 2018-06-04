import Eos from 'eosjs'
import sjcl from 'sjcl'
import BigNumber from 'bignumber.js'

const { ecc } = Eos.modules

// 错误处理

export const handleApiError = err => {
  return new Promise((resolve, reject) => {
    try {
      const json = JSON.parse(err)
      const error = json.error
      const apiError = new Error(json.error.details[0].message)
      apiError.code = error.code
      reject(apiError)
    } catch (e) {
      reject(err)
    }
  })
}

// 返回随机私钥
export const randomKey = (...args) => ecc.randomKey(...args)

// 私钥转公钥
export const privateToPublic = (...args) => ecc.privateToPublic(...args)

// 加密
export const encrypt = (key, data) => {
  if (typeof data === 'object') data = JSON.stringify(data)
  const { iv, salt, ct } = JSON.parse(sjcl.encrypt(key, data, { mode: 'gcm' }))
  return JSON.stringify({ iv, salt, ct })
}

// 解密
export const decrypt = (key, encryptedData) => {
  encryptedData = JSON.stringify(Object.assign(JSON.parse(encryptedData), { mode: 'gcm' }))
  let clear = sjcl.decrypt(key, encryptedData)
  return JSON.parse(clear)
}

export const getTimeStamp = date => {
  const hackDate = (new Date().toISOString()).split('.')[0]
  const dateObj = date ? new Date(date) : new Date(hackDate)
  return (+dateObj / 1000) | 0
}

export const isZero = (str = '') => {
  return /^0[0\.]*$/.test(String(str))
}

// 'XXX EOS或 XXX 转化为 bignumber 格式'
export const toBigNumber = asset => {
  if (BigNumber.isBigNumber(asset)) {
    return asset
  } else if (isNaN(asset)) {
    if (!asset) return new BigNumber('0')
    const match = asset.match(/^([0-9\.]+) EOS$/)
    const amount = match ? match[1] : '0'
    return new BigNumber(amount)
  } else {
    return new BigNumber(asset)
  }
}

// '字符串或数字或 bignumber 格式转化为 XXX EOS 格式'
export const toAsset = _amount => {
  const amount = toBigNumber(_amount).toFixed(4)
  return [amount, 'EOS'].join(' ')
}

// 累加金额，返回 BigNumber
export const calcTotalAmount = (rows = [], key) => {
  return rows.reduce((result, row) => {
    const value = toBigNumber(key ? row[key] : row)
    return result.plus(value)
  }, new BigNumber('0'))
}

// 计算分红金额，返回 BigNumber
export const clacReward = (staked, stake_time, total_voteage, rewards_pool, total_staked) => {
  const totalStakedAmount = toBigNumber(total_staked)
  const stakedAmount = toBigNumber(staked)
  const stakeTimestamp = toBigNumber(getTimeStamp(stake_time))
  const nowTimestamp = toBigNumber(getTimeStamp())
  const totalVoteageAmount = toBigNumber(total_voteage)
  const rewardsPoolAmount = toBigNumber(rewards_pool)
  const time = nowTimestamp.minus(stakeTimestamp)
  if (!totalVoteageAmount.isZero()) {
    return stakedAmount
      .multipliedBy(10000)
      .multipliedBy(time)
      .multipliedBy(rewardsPoolAmount)
      .dividedBy(totalVoteageAmount.plus(totalStakedAmount.multipliedBy(10000).multipliedBy(time)))
  } else {
    return toBigNumber(0)
  }
}

// 计算分红金额，返回 BigNumber
export const clacAverage = (total_voteage, total_staked, voteage_update_time) => {
  const totalStakedAmount = toBigNumber(total_staked)
  const voteageUpdateTimestamp = toBigNumber(getTimeStamp(voteage_update_time))
  const totalVoteageAmount = toBigNumber(total_voteage)
  const nowTimestamp = toBigNumber(getTimeStamp())
  const time = nowTimestamp.minus(voteageUpdateTimestamp)
  if (!totalStakedAmount.isZero()) {
    return toBigNumber(totalVoteageAmount)
      .dividedBy(10000)
      .dividedBy(toBigNumber(totalStakedAmount))
      .plus(time)
  } else {
    return toBigNumber(0)
  }
}

// 是否是 object
export const isObject = val => val != null && typeof val === 'object'

export const decryptWif = (password, data) => {
  try {
    const wif = decrypt(password, data).privateKey
    return Promise.resolve(wif)
  } catch (err) {
    return Promise.reject(new Error('密码错误'))
  }
  return decrypt(password, data).privateKey
}

export const genTrConvertFunc = trName => {
  const defaultFunc = tr => {
    const act = tr.action_trace.act
    return {
      seq: tr.global_action_seq,
      time: tr.block_time,
      name: act.name,
      from: act.authorization && act.authorization[0] && act.authorization[0].actor,
    }
  }
  return (
    {
      newaccount: tr => {
        const act = tr.action_trace.act
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '创建用户',
          from: act.authorization && act.authorization[0] && act.authorization[0].actor,
        }
      },
      vote: tr => {
        const act = tr.action_trace.act
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '投票',
          from: act.data.voter,
          to: act.data.bpname,
          change: act.data.change,
        }
      },
      transfer: tr => {
        const act = tr.action_trace.act
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '转账',
          from: act.data.from,
          to: act.data.to,
          change: act.data.quantity,
          memo: act.data.memo,
        }
      },
      claim: tr => {
        const act = tr.action_trace.act
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '提取分红',
          from: act.data.bpname,
          to: act.data.voter,
        }
      },
      unfreeze: tr => {
        const act = tr.action_trace.act
        return {
          seq: tr.global_action_seq,
          time: tr.block_time,
          name: '解冻',
          from: act.data.bpname,
          to: act.data.voter,
        }
      },
    }[trName] || defaultFunc
  )
}
