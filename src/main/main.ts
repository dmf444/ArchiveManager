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
import {sendError, sendSuccess} from "@main/NotificationBundle";
import {autoUpdateControl} from '@main/updater/AutoUpdateController';
import {DescriptionFileReader} from "@main/description/DescriptionFileReader";
import {FileUploader} from '@main/FileUploader';
import {Authentication} from "@main/google/Authentication";
import {YoutubeDlpManager} from '@main/youtubedl/YoutubeDlpManager';
import {IWebDatabase} from "@main/database/IWebDatabase";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";
import {WebDatabaseHttp} from "@main/database/WebDatabaseHttp";
import {GroupManager} from "@main/group/GroupManager";
import {FileModel} from '@main/file/FileModel';
import {GroupModel} from '@main/group/models/GroupModel';
import {GroupEditBuilder} from '@main/group/controller/GroupEditBuilder';
import * as fs from 'fs';
import RemoteServerApi from "@main/api/RemoteServerApi";
const contextMenu = require('electron-context-menu');
const log = require('electron-log');
const electronDl = require('electron-dl');



let mainWindow: Electron.BrowserWindow | null;
var bot: Bot;
var db = null;
var settings: SettingsManager;
var events = new EventDispatcher<notificationPackage>();
let webDatabase: IWebDatabase;
let fileManager: FileManager;
let dlManager: YoutubeDLManager;
let dlpManager: YoutubeDlpManager;
let fileUpdateBuilder: FileEditBuilder = null;
let groupUpdateBuilder: GroupEditBuilder = null;
let tray = null;
let descFileReader: DescriptionFileReader = null;
let googleManager: Authentication = null;


electronDl();
contextMenu();

export function getEventsDispatcher() {
    return events;
}

export function getFileDatabase(): FileDatabase | null {
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


export function getYoutubeDlpManager() {
    return dlpManager;
}

export function getFileUpdater() {
    return fileUpdateBuilder;
}

export function getGroupUpdater() {
    return groupUpdateBuilder;
}

export function getMainWindow() {
    return mainWindow;
}

export function getDescriptionReader() {
    return descFileReader;
}

export function getGoogleAuth() {
    return googleManager;
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

    let uploadSetting: WebDatabaseSettings = <WebDatabaseSettings>getSettingsManager().getSettings("remotedb");
    if(uploadSetting.hostAddr != "" && uploadSetting.databaseName != "" && uploadSetting.username != "") {
        webDatabase = new WebDatabase();
    } else {
        webDatabase = new WebDatabaseHttp();
    }

    googleManager = new Authentication();
    fileManager = new FileManager();


    let disc_bot = new Bot();
    disc_bot.start();
    bot = disc_bot;



    dlpManager = new YoutubeDlpManager(filePath);
    dlpManager.getNewestDownloaderVersion();
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
    let data: (FileModel|GroupModel)[] = db.getNonNewFiles().concat(db.getAllGroups());
    event.sender.send('files_get_normal_reply', data);
});

ipcMain.on('homepage_url_add', function (event, arg) {
    fileManager.downloadFile(arg, false);
});

ipcMain.on('status_box_discord_get', function(event, arg) {
    event.sender.send('status_box_discord_reply', bot.isOnline());
});

ipcMain.on('status_box_webdb_get', function(event, arg) {
    event.sender.send('status_box_webdb_reply', webDatabase.isConnected() && webDatabase instanceof WebDatabase);
});

ipcMain.on('status_box_remotedb_get', function(event, arg) {
    event.sender.send('status_box_remotedb_reply', webDatabase.isConnected() && webDatabase instanceof WebDatabaseHttp);
});

ipcMain.on('file_delete', function(event, arg) {
    getFileManager().removeFileById(arg);
});

ipcMain.on('file_download', function(event, arg) {
    let file: FileModel = getFileDatabase().getFileById(arg);
    getFileManager().moveFileToIngest(file, true);
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

ipcMain.on('open_config_folder', function (event, args) {
    shell.showItemInFolder(app.getPath('userData') + path.sep + "appdb.json");
})

ipcMain.on('get_downloaders', function (event, arg) {
    event.sender.send('get_downloaders_reply', getFileManager().getDownloaders());
});

ipcMain.on('file_redownload', function (event, arg) {
    getFileManager().redownloadFile(getFileDatabase().getFileById(arg[0]), arg[1]);
    //event.sender.send('get_downloaders_reply', getFileManager().getDownloaders());
});

ipcMain.on('file_edit_start', function (event, arg) {
    if(arg.length == 2) {
        let group: GroupModel = getFileDatabase().getGroupById(arg[0]);
        fileUpdateBuilder = new FileEditBuilder(group.findFileById(arg[1]), group.id);
    } else {
        fileUpdateBuilder = new FileEditBuilder(getFileDatabase().getFileById(arg));
    }
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


ipcMain.on('import_local_file', function (event, copyFile: boolean, filePaths: []) {
    filePaths.forEach((fileModule: {path: string, fileName: string}) => {
       getFileManager().addFileFromLocal(fileModule.path, fileModule.fileName, copyFile);
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
    let api = new RemoteServerApi();
    api.getToken().then(success => {
        if(!success) {
            event.sender.send("status_update", false);
            sendError("Login Request Failed!", "Unable to login to the Archives.");
            return;
        }

        let uploader = new FileUploader(getFileDatabase().getFileById(id), api);
        uploader.upload();
    });
});

ipcMain.on('upload_list_get', function (event, args) {
    event.sender.send('upload_list_reply', getFileDatabase().getAllUploads());
});

ipcMain.on('download_list_get', function (event, args) {
    event.sender.send('download_list_reply', getFileDatabase().getAllDownloads());
});

ipcMain.on('authenitication_url_generate', function (event, apiRequest: string) {
    if(apiRequest === "google") {
        let url = getGoogleAuth().createAuthUrl();
        shell.openExternal(url);
    }
});

ipcMain.on('code_verification', function (event, apiRequester: string, values) {
    if(apiRequester === "google") {
        getGoogleAuth().registerCode(values.code);
    }
});

ipcMain.on('import_directory', async function (event, args: {type: "grouped" | "individual", path: string, files: {fileName: string, filePath: string, relativePath: string}[] }) {
   await GroupManager.importGroup(args);
});

ipcMain.on('group_get_content', function (event, args: number) {
   event.sender.send('group_get_content_reply', getFileDatabase().getGroupById(args));
});

ipcMain.on('group_start_editing', function (event, arg) {
    groupUpdateBuilder = new GroupEditBuilder(getFileDatabase().getGroupById(arg));
});

ipcMain.on('group_save_editing', function (event, arg) {
    groupUpdateBuilder.commit();
    event.sender.send('group_get_content_reply', groupUpdateBuilder.getGroup());
    sendSuccess("Group Info Saved!", "Successfully saved the group metadata.");
});

ipcMain.on('group_delete', function(event, arg) {
    GroupManager.deleteGroup(getFileDatabase().getGroupById(arg));
});

ipcMain.on('group_upload', function (event, args) {
    groupUpdateBuilder.commit();
    GroupManager.uploadGroup(getFileDatabase().getGroupById(args));
});

ipcMain.on("chooseFile", (event, arg) => {
    let clip: number = arg.lastIndexOf(".");
    let filetype = arg.substring(clip + 1);
    if(["jpg", "jpeg", "png", "gif", "webp"].includes(filetype.toLowerCase())) {
        const base64 = fs.readFileSync(arg).toString('base64');
        event.sender.send("chooseFile", base64);
    }
});
