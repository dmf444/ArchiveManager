/**
 * Entry point of the Election app.
 */
import {app, BrowserWindow, ipcMain, shell, Tray, Menu, nativeImage} from 'electron';
import * as path from 'path';
import * as url from 'url';
import {EventDispatcher, notificationPackage} from './Events';
import {SettingsManager} from '@main/settings/SettingsManager';
import {WebDatabase} from '@main/database/WebDatabase';
import {Bot} from '@main/DiscordBot';
import {FileDatabase} from '@main/database/LocalDatabase';
import {FileManager} from "@main/downloader/FileManager";
import {YoutubeDLManager} from "@main/youtubedl/YoutubeDLManager";
import {FileEditBuilder} from "@main/file/FileEditBuilder";
import {sendSuccess} from "@main/NotificationBundle";
import {autoUpdateControl} from '@main/updater/AutoUpdateController';
import {DescriptionFileReader} from "@main/description/DescriptionFileReader";
import {FileUploader} from '@main/FileUploader';
const contextMenu = require('electron-context-menu');
const icon = require('@public/archivesLogo.ico');
const log = require('electron-log');
const electronDl = require('electron-dl');



let mainWindow: Electron.BrowserWindow | null;
var bot: Bot;
var db = null;
var settings: SettingsManager;
var events = new EventDispatcher<notificationPackage>();
let webDatabase: WebDatabase;
let fileManager: FileManager;
let dlManager: YoutubeDLManager;
let fileUpdateBuilder: FileEditBuilder = null;
let tray = null;
let descFileReader: DescriptionFileReader = null;


electronDl();
contextMenu();

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

export function getYoutubeDlManager() {
    return dlManager;
}

export function getFileUpdater() {
    return fileUpdateBuilder;
}

export function getMainWindow() {
    return mainWindow;
}

export function getDescriptionReader() {
    return descFileReader;
}

function createWindow(): void {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 820,
        icon: nativeImage.createFromPath(path.join(__dirname, './archivesLogo.ico')),
        webPreferences: {
            webSecurity: false,
            devTools: process.env.NODE_ENV !== 'production',
            nodeIntegration: true
        }
    });
    log.info("Something wrong while creating window?");

    mainWindow.setTitle('Archives Manager');
    mainWindow.setMenuBarVisibility(false);

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

export function toggleMenu() {
    if(mainWindow != null){
        if(mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    } else {
        createWindow();
    }
}

function createTrayMenu() {
    let ico = path.join(__dirname, "public", "archivesLogo.ico");
    tray = new Tray(ico);
    tray.setToolTip("Archives Manager");
    let image: nativeImage = nativeImage.createFromPath(ico);
    image = image.resize({width: 16, height: 16, quality: "better"});
    //log.info(image.getSize());
    let contextMenu = Menu.buildFromTemplate([
        {label: "Super Control Panel", type: "normal", enabled: false, icon: image},
        {type: "separator"},
        {label: "Toggle Window Visibility", type: "normal", click: (menuItem, browserWindow, event) => {toggleMenu()}},
        {label: "Close Program", type: "normal", click: (menuItem, browserWindow, event) => { app.quit()}}
    ]);
    tray.setContextMenu(contextMenu);
    tray.on('click', (event, bounds, position) => {toggleMenu()});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);
app.whenReady().then(() => {
    autoUpdateControl.checkForUpdates();
    createTrayMenu();


    let filePath = app.getPath('userData');

    db = new FileDatabase(filePath);
    settings = new SettingsManager(db);
    descFileReader = new DescriptionFileReader();
    descFileReader.initializeFolder(filePath);
    webDatabase = new WebDatabase();
    fileManager = new FileManager();

    let disc_bot = new Bot();
    disc_bot.start();
    bot = disc_bot;

    dlManager = new YoutubeDLManager(filePath);
    dlManager.getNewestDownloaderVersion();
    log.info("Launched with version:", app.getVersion());

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        mainWindow.hide();
    }
});

app.on('will-quit', () => {
   if(tray != null) {
       tray.destroy();
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

ipcMain.on('files_get_normal', function(event, arg) {
    event.sender.send('files_get_normal_reply', db.getNonNewFiles());
});

ipcMain.on('homepage_url_add', function (event, arg) {
    fileManager.downloadFile(arg, false);
});

ipcMain.on('status_box_discord_get', function(event, arg) {
    event.sender.send('status_box_discord_reply', bot.isOnline());
});

ipcMain.on('status_box_webdb_get', function(event, arg) {
    event.sender.send('status_box_webdb_reply', webDatabase.isConnected());
});

ipcMain.on('file_delete', function(event, arg) {
    getFileManager().removeFileById(arg);
});

ipcMain.on('file_download', function(event, arg) {
    getFileManager().moveFileToIngestById(arg);
});

ipcMain.on('stats_new_files', function(event, arg) {
    event.sender.send('stats_new_files_reply', db.getNewFiles().length);
});

ipcMain.on('stats_all_files', function(event, arg) {
    event.sender.send('stats_all_files_reply', db.getAllFileCount());
});

ipcMain.on('stats_error_files', function(event, arg) {
    event.sender.send('stats_error_files_reply', db.getErrorFileCount());
});

ipcMain.on('shell_open', function(event, arg) {
    shell.openExternal(arg);
});

ipcMain.on('shell_open_file', function(event, arg) {
    shell.showItemInFolder(arg);
});

ipcMain.on('get_downloaders', function (event, arg) {
    event.sender.send('get_downloaders_reply', getFileManager().getDownloaders());
});

ipcMain.on('file_redownload', function (event, arg) {
    getFileManager().redownloadFile(getFileDatabase().getFileById(arg[0]), arg[1]);
    //event.sender.send('get_downloaders_reply', getFileManager().getDownloaders());
});

ipcMain.on('file_edit_start', function (event, arg) {
    fileUpdateBuilder = new FileEditBuilder(getFileDatabase().getFileById(arg));
});

ipcMain.on('file_edit_save', function (event, arg) {
    fileUpdateBuilder.commitFile();
    sendSuccess("File Saved!", "Successfully saved the file metadata.");
});

ipcMain.on('file_edit_get_tags', function (event, arg) {
    getWebDatabase().getAllTags(arg).then((tags: string[]) => {
        event.sender.send('file_edit_get_tags_reply', tags);
    });
});

ipcMain.on('file_edit_get_containers', function (event, arg) {
    getWebDatabase().getContainers().then((containers: any[]) => {
        event.sender.send('file_edit_get_containers_reply', containers);
    });
});


ipcMain.on('import_local_file', function (event, filePaths: []) {
    filePaths.forEach((fileModule: {path: string, fileName: string}) => {
       getFileManager().addFileFromLocal(fileModule.path, fileModule.fileName);
    });
});

ipcMain.on('info_update_status', function (event, arg) {
    event.sender.send('info_update_status_reply', autoUpdateControl.getUpdateInfo());
});

ipcMain.on('file_edit_get_desc_version', function (event, arg) {
    event.sender.send('file_edit_get_desc_version_reply', descFileReader.getAllVersions());
});

ipcMain.on('file_description_format_get', function (event, version: string) {
    event.sender.send('file_description_format_reply', descFileReader.getDescriptionContent(version));
});

ipcMain.on('file_upload', function (event, id:number) {
    fileUpdateBuilder.commitFile();
    let uploader = new FileUploader(getFileDatabase().getFileById(id));
    uploader.upload();
});

ipcMain.on('upload_list_get', function (event, args) {
    event.sender.send('upload_list_reply', getFileDatabase().getAllUploads());
});

ipcMain.on('download_list_get', function (event, args) {
    event.sender.send('download_list_reply', getFileDatabase().getAllDownloads());
});