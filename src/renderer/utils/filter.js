import dayjs from 'dayjs';

import BigNumber from 'bignumber.js';

export const timestamp = (value, format = 'YYYY-MM-DD HH:mm:ss') => {
  value = value + 'Z';
  const date = dayjs(value);
  if (date.isValid()) {
    return date.format(format);
  } else {
    return value;
  }
};

// p 精度
// showSymbol 是否显示货币符号，默认不显示
// symbol 货币符号，默认为 EOS 或自动获取
// separator 是否使用逗号分隔数字，默认为真
// sign 数字后单位，默认空
// percentage 数字的倍率
export const formatNumber = (value, { p, showSymbol, symbol = 'EOS', separator = true, sign, percentage } = {}) => {
  if (BigNumber.isBigNumber(value)) {
    value = value.toNumber();
  }
  if (isNaN(value) && typeof value === 'string' && /^[0-9.-]+\s([A-Z]+)$/.test(value)) {
    [value, symbol] = value.split(' ');
  }
  if (typeof value === 'string' && !isNaN(value)) {
    if (p === undefined) {
      const match = value.match(/\.(\d*)/);
      if (match && match[1]) {
        p = match[1].length;
      } else {
        p = 0;
      }
    }
    value = Number(value);
  } else if (typeof value !== 'number') {
    return value;
  }
  if (percentage) {
    value = value * percentage;
  }
  if (!isNaN(p)) {
    value = value.toFixed(p);
  } else {
    value = String(value);
  }
  if (sign) {
    return value + sign;
  }
  if (separator) {
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    value = parts.join('.');
  }
  if (showSymbol) {
    return [value, symbol].join(' ');
  }
  return value;
};
