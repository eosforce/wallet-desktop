import dayjs from 'dayjs';

import { toBigNumber } from '@/utils/util';
import BigNumber from 'bignumber.js';

export const number = (value, p = 4) => {
  if (isNaN(value)) {
    return toBigNumber(value).toFixed(p);
  } else {
    return Number(value).toFixed(p);
  }
};

export const intPartFormat = (value, p = 4) => {
  if (isNaN(value)) {
    return toBigNumber(value).toFixed(p);
  } else {
    const intPart = Number(value).toFixed(p);
    const intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
    return intPartFormat;
  }
};

export const NumFormat = (value, p = 4) => {
  if (!value) return '0.0000';
  const intPart = Number(value).toFixed(0);
  const intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  var floatPart = '.0000';
  var value2Array = value.split('.');
  if (value2Array.length === 2) {
    floatPart = value2Array[1].toString();
    if (floatPart.length === 1) {
      return intPartFormat + '.' + floatPart + '0';
    } else {
      return intPartFormat + '.' + floatPart;
    }
  } else {
    return intPartFormat + floatPart;
  }
};

export const asset = (value, symbol = 'EOS') => {
  if (isNaN(value)) return value;
  return [value, symbol].join(' ');
};

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
