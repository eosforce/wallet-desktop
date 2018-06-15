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

export const asset = value => {
  if (isNaN(value)) return value;
  return [value, 'EOS'].join(' ');
};

export const rate = value => {
  if (isNaN(value)) {
    return rate;
  } else {
    return [
      toBigNumber(value)
        .dividedBy(100)
        .toFixed(2),
      '%',
    ].join(' ');
  }
};

export const yearrate = (value, rate) => {
  return (
    new BigNumber((9 * 20 * 60 * 24 * 365) / 23)
      .multipliedBy(rate)
      .dividedBy(toBigNumber(value))
      .multipliedBy(100)
      .toFixed(0) + '%'
  );
};

export const voteage = (value, p = 1) => {
  if (isNaN(value)) {
    return toBigNumber(value).toFixed(p) + '小时';
  } else {
    return (
      toBigNumber(value)
        .dividedBy(3600)
        .toFixed(p) + '小时'
    );
  }
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

export const sTom = (value, p = 1) => {
  if (isNaN(value)) {
    return toBigNumber(value).toFixed(p);
  } else {
    return toBigNumber(value)
      .dividedBy(60)
      .toFixed(p);
  }
};
