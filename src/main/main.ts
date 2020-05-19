/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import {EventDispatcher, notificationPackage} from './Events';
import {SettingsManager} from '@main/settings/SettingsManager';
import {WebDatabase} from '@main/database/WebDatabase';
import {Bot} from '@main/DiscordBot';
import {FileDatabase} from '@main/database/LocalDatabase';
import {DefaultDownloader} from "@main/downloader/DefaultDownloader";
import {FileManager} from "@main/downloader/FileManager";
const log = require('electron-log');
const electronDl = require('electron-dl');


let mainWindow: Electron.BrowserWindow | null;
var bot: Bot;
var db = null;
var settings: SettingsManager;
var events = new EventDispatcher<notificationPackage>();
let webDatabase: WebDatabase;
let fileManager: FileManager;


electronDl();

export function getEventsDispatcher() {
    return events;
}

export function getFileDatabase() {
    return db;
}

export function getSettingsManager() {
    return settings;
}

export function getWebDatabase() {
    return webDatabase;
}

export function reloadDiscordBot() {
    bot.reloadSettings();
}

export function reloadWebDatabase() {
    webDatabase.initDatabase();
}

export function getFileManager() {
    return fileManager;
}


function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 820,
        icon: 'public/smcs.ico',
        webPreferences: {
            webSecurity: false,
            devTools: process.env.NODE_ENV !== 'production'
        }
    });


    mainWindow.setTitle('');
    //mainWindow.setMenuBarVisibility(false);

    // and load the index.html of the app.
    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, './index.html'),
            protocol: 'file:',
            slashes: true
        })
    );

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.whenReady().then(() => {
    let filePath = app.getPath('userData');

    db = new FileDatabase(filePath);
    settings = new SettingsManager(db);
    webDatabase = new WebDatabase();
    fileManager = new FileManager();

    let disc_bot = new Bot();
    disc_bot.start();
    bot = disc_bot;

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it"s common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
});


/**
 *
 */
ipcMain.on('settings_fields_get', function (event, arg) {
    event.sender.send('setting_fields_get_reply', getSettingsManager().getRenderSettings());
});

ipcMain.on('settings_fields_update', function (event, arg) {
    for(let i = 0; i < arg.length; i++){
        let info = arg[i];

        let setting: ISettings = getSettingsManager().getSettings(info['category']);
        if(!setting.equals(info['data'])){
            setting.fromJson(info['data']);
            getSettingsManager().updateSettings(setting);
        }
    }
});

ipcMain.on('files_get_new', function(event, arg) {
   event.sender.send('files_get_new_reply', db.getNewFiles());
});

ipcMain.on('homepage_url_add', function (event, arg) {
    let downloader: DefaultDownloader = new DefaultDownloader();
    log.info(arg);
    if(downloader.acceptsUrl(arg)) {
        downloader.downloadUrl(arg, false);
    }
});

ipcMain.on('status_box_discord_get', function(event, arg) {
    event.sender.send('status_box_discord_reply', bot.isOnline());
});

ipcMain.on('status_box_webdb_get', function(event, arg) {
    event.sender.send('status_box_webdb_reply', webDatabase.isConnected());
});

