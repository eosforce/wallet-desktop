import dayjs from 'dayjs';

import { toBigNumber } from '@/utils/util';

export const number = (value, p = 4) => {
  if (isNaN(value)) {
    return toBigNumber(value).toFixed(p);
  } else {
    return Number(value).toFixed(p);
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
