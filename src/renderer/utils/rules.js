import eos from 'eosforce';

const { ecc } = eos.modules;

export const isValidPassword = password => {
  return password && password.length >= 9 && password.length <= 36;
};

// @TODO 钱包名规则
export const isValidWalletName = name => {
  return name && name.length >= 1 && name.length < 64;
};

// Must be less than 13 characters
// Can only contain the following symbols: .12345abcdefghijklmnopqrstuvwxyz
// https://github.com/EOSIO/eos/blob/dacc1b09d2c10cc3ca4cea7821c04ea2a47487fe/libraries/chain/name.cpp#L20
export const isValidAccountName = name => {
  if (!name) return false;
  return /^[.12345abcdefghijklmnopqrstuvwxyz]{1,12}$/.test(name);
};

// 验证私钥 WIF 格式
export const isValidPrivate = (...args) => ecc.isValidPrivate(...args);

export const isValidPublic = (...args) => ecc.isValidPublic(...args);

// 验证金额格式
export const isValidAmount = (value, { precision = 4 } = {}) => {
  if (isNaN(value)) return false;
  const decimal = `${value}`.split('.')[1];
  if (decimal) {
    if (decimal.length > precision) return false;
  }
  return true;
};

// 验证手续费率
export const isValidRate = (...args) => true;
