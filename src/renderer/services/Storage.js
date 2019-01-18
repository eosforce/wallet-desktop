import uuidV4 from 'uuid/v4';

import { privateToPublic, encrypt } from '@/utils/util';
import { EOSFORCE_WALLET_KEY } from '@/constants/config.constants';
import { isValidPassword, isValidPrivate } from '@/utils/rules';
import Store from '@/store';

export default class Storage {
  constructor(storagePath) {
    this.storagePath = storagePath;
  }

  static setPath(storagePath) {
    if (!storagePath) throw new Error('storagePath 不能为空');
    return new Storage(storagePath);
  }

  async store(data) {
    try {
      localStorage.setItem(this.storagePath, JSON.stringify(data));
      return data;
    } catch (err) {
      return err;
    }
  }

  async fetch_data () {
    const _data = localStorage.getItem(this.storagePath);
    let json_data = null;
    try {
      json_data = JSON.parse(_data);
    } catch (err) {
      json_data = err;
    }
    return json_data
  }

  async fetch() {
    const _data = localStorage.getItem(this.storagePath);
    let res = null;
    try {
      res = JSON.parse(_data);
    } catch (err) {
      res = null;
    }
    return res;
  }

  remove() {
    return Promise.resolve(localStorage.removeItem(this.storagePath));
  }
}

export const getWalletIdFromKey = (key = '') => {
  const reg = new RegExp(`^${EOSFORCE_WALLET_KEY}/(.*)#${Store.state.app.chainNet}`);
  const matchResult = key.match(reg);
  return matchResult && matchResult[1] ? matchResult[1] : null;
};

export const getWalletIdList = () => {
  return Object.keys(localStorage)
    .map(key => getWalletIdFromKey(key))
    .filter(value => value);
};

export const getWalletKeyFromId = id => {
  return `${EOSFORCE_WALLET_KEY}/${id}#${Store.state.app.chainNet}`;
};

export const createWalletData = ({ privateKey, password, symbol = 'EOS' }) => {
  if (isValidPrivate(privateKey) && isValidPassword(password)) {
    const publicKey = privateToPublic(privateKey, symbol);
    const crypto = encrypt(password, { privateKey });
    const id = uuidV4();
    const data = {
      version: '1',
      id,
      publicKey,
      crypto,
    };
    return Storage.setPath(getWalletKeyFromId(publicKey)).store(data);
  } else {
    return Promise.reject(new Error('数据格式错误'));
  }
};

export const deleteWalletData = ({ publicKey }) => {
  return Storage.setPath(getWalletKeyFromId(publicKey)).remove();
};
