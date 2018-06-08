import { remote } from 'electron';
const dialog = remote.dialog;
const { autoUpdater } = remote.require('electron-updater');

let updater;
autoUpdater.autoDownload = false;

autoUpdater.on('error', error => {
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString());
});

autoUpdater.on('update-available', () => {
  dialog.showMessageBox(
    {
      type: 'info',
      title: '发现新版本',
      message: '是否立即更新新版本，确认后会在后台下载更新。',
      buttons: ['更新', '取消'],
    },
    buttonIndex => {
      if (buttonIndex === 0) {
        autoUpdater.downloadUpdate();
      } else {
        updater.enabled = true;
        updater = null;
      }
    }
  );
});

autoUpdater.on('update-not-available', () => {
  dialog.showMessageBox({
    title: '没有更新',
    message: '你当前的版本是最新的！',
  });
  updater.enabled = true;
  updater = null;
});

autoUpdater.on('update-downloaded', () => {
  dialog.showMessageBox(
    {
      title: '安装更新',
      message: '更新已下载完成，确认后会自动安装',
    },
    () => {
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  );
});

export const checkForUpdates = (menuItem, focusedWindow, event) => {
  updater = menuItem;
  updater.enabled = false;
  autoUpdater.checkForUpdates();
};
