import {BrowserWindow, ipcMain} from "electron";
import {getEventsDispatcher} from "@main/main";

const {autoUpdater} = require("electron-updater");
const log = require('electron-log');



export class AutoUpdateController {

    private currentVersion;
    private remoteVersion;
    private lastChecked;

    constructor() {
        autoUpdater.logger = require("electron-log");
        this.currentVersion = autoUpdater.currentVersion.version;
    }

    public checkForUpdates() {
        getEventsDispatcher().dispatch({type: "webserver", data: { subtype: "update" }});
        autoUpdater.checkForUpdatesAndNotify().then((results) => {
            if(results != null) {
                this.remoteVersion = results.updateInfo.version;
            }
        });
        autoUpdater.on('download-progress', (progressObj) => {
            log.info(progressObj.percent);
        });
        autoUpdater.on('update-downloaded', (info) => {
            autoUpdater.quitAndInstall();
        });

        this.lastChecked = Date.now();
    }

    public getUpdateInfo() {
        return {curVersion: this.currentVersion, remVersion: this.remoteVersion, lastCheck: this.lastChecked};
    }


}

ipcMain.on('info_update_request', function (event, arg) {
    autoUpdateControl.checkForUpdates();
    BrowserWindow.getAllWindows()[0].webContents.send('info_update_status_reply', autoUpdateControl.getUpdateInfo());
});

export const autoUpdateControl = new AutoUpdateController();