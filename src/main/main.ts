/**
 * Entry point of the Election app.
 */
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import {EventDispatcher, notificationPackage} from './Events';
import {DiscordSettings} from "./settings/DiscordSettings";
import {FileManagement} from "./FileManagement";
import {SettingsManager} from '@main/settings/SettingsManager';
import {WebDatabase} from '@main/database/WebDatabase';
import {Bot} from '@main/DiscordBot';
import {FileDatabase} from '@main/database/LocalDatabase';
const log = require('electron-log');
const electronDl = require('electron-dl');


let mainWindow: Electron.BrowserWindow | null;
var bot: Bot;
var db = null;
var settings: SettingsManager;
var events = new EventDispatcher<notificationPackage>();
let webDatabase: WebDatabase;


electronDl();

export function getEventsDispatcher() {
    return events;
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

    //FileManagement.downloadFile("http://localhost/smcsarchives/images/reallycoolRailway.jpg");
    /*let disc_bot = new Bot();
    disc_bot.start();
    bot = disc_bot;*/

    //let webDatabase = new WebDatabase();
    //webDatabase.matchImage('8063e8f6606f5e7d11ccd3e81839ca05').then(value => log.info("The database returned: " + value))
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
ipcMain.on('variable-request-settings', function (event, arg) {
    event.sender.send('variable-reply', getSettingsManager().getRenderSettings());
});

ipcMain.on('variable-send-settings-update', function (event, arg) {
    for(let i = 0; i < arg.length; i++){
        let info = arg[i];

        let setting: ISettings = getSettingsManager().getSettings(info['category']);
        if(!setting.equals(info['data'])){
            setting.fromJson(info['data']);
            getSettingsManager().updateSettings(setting);
        }
    }
});

