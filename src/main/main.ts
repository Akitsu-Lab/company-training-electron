/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * Electron のメインプロセスで実行されるコード。
 * このスクリプトは Electron アプリケーションを起動し、レンダラープロセスと通信するための仕組みを提供する。
 */

import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';

/**
 * アプリケーションの自動更新を設定するクラス
 */
class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'; // ログレベルを「info」に設定
    autoUpdater.logger = log; // 自動アップデートのログ出力を設定
    autoUpdater.checkForUpdatesAndNotify(); // 更新を確認し通知
  }
}

let mainWindow: BrowserWindow | null = null; // メインウィンドウの参照を保持する変数

/**
 * IPC（プロセス間通信）の例。レンダラープロセスからのメッセージを受信し、返信を送る。
 */
ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg)); // コンソールに受信したメッセージを出力
  event.reply('ipc-example', msgTemplate('pong')); // レンダラーに返信
});

/**
 * production 環境の場合、Source Map のサポートを有効化する。
 * これによりデバッグ時にトランスパイルされたコードではなく元のコードでエラー箇所を確認できる。
 */
if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

/**
 * 開発モードまたはデバッグモードかどうかを判定する。
 */
const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')(); // 開発時の便利なデバッグツールを有効化
}

/**
 * Electron DevTools をインストールする関数（開発環境のみ）。
 */
const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS; // 拡張機能の再インストールを強制するか
  const extensions = ['REACT_DEVELOPER_TOOLS']; // 必要な拡張機能のリスト

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

/**
 * アプリケーションのメインウィンドウを作成する関数
 */
const createWindow = async () => {
  if (isDebug) {
    await installExtensions(); // 開発用の拡張機能をインストール
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets') // パッケージ化されたリソースパス
    : path.join(__dirname, '../../assets'); // 開発環境用のリソースパス

  /**
   * 指定されたパスに基づいてリソースへの絶対パスを取得するヘルパー関数
   */
  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  // メインウィンドウの設定
  mainWindow = new BrowserWindow({
    show: false, // 初期表示時にウィンドウを非表示
    width: 1024, // ウィンドウの幅
    height: 728, // ウィンドウの高さ
    icon: getAssetPath('icon.png'), // アプリアイコンの指定
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js') // パッケージ化時のプリロードスクリプト
        : path.join(__dirname, '../../.erb/dll/preload.js'), // 開発環境用
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html')); // レンダラーに表示する HTML を読み込む

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize(); // 最小化された状態で開始
    } else {
      mainWindow.show(); // ウィンドウを表示
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null; // ウィンドウが閉じられた際に参照を解放
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu(); // カスタムメニューを作成

  // ユーザーがクリックしたリンクを外部ブラウザで開くように設定
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url); // 外部リンクをデフォルトブラウザで開く
    return { action: 'deny' }; // ウィンドウ作成を拒否
  });

  // 自動更新を有効化
  new AppUpdater();
};

/**
 * アプリケーション全体のイベントリスナーの設定
 */
app.on('window-all-closed', () => {
  // macOS 以外では、全てのウィンドウが閉じられたらアプリケーションを終了
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady() // アプリケーションが初期化を完了したら
  .then(() => {
    createWindow(); // メインウィンドウを作成
    app.on('activate', () => {
      // macOS の場合、Dock アイコンがクリックされた時にウィンドウを再作成
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log); // エラーが発生した場合はログに出力
