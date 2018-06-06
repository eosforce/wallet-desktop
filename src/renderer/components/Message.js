import { Notification } from 'element-ui';

export default {
  getConfig(defaultConfig, value) {
    return typeof value === 'string'
      ? {
          ...defaultConfig,
          title: value
        }
      : {
          ...defaultConfig,
          ...value
        };
  },
  warning(value) {
    return Notification(
      this.getConfig(
        {
          type: 'warning',
          duration: 3000,
          position: 'top-left'
        },
        value
      )
    );
  },
  error(value) {
    return Notification(
      this.getConfig(
        {
          type: 'error',
          title: '错误',
          duration: 6000,
          position: 'top-left'
        },
        value
      )
    );
  },
  success(value) {
    return Notification(
      this.getConfig(
        {
          type: 'success',
          duration: 3000,
          position: 'top-left'
        },
        value
      )
    );
  }
};
