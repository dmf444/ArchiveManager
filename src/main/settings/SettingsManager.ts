import {getEventsDispatcher} from '@main/main';
import {FileDatabase} from '@main/database/LocalDatabase';

const log = require('electron-log');
const {} = require("../main");

export class SettingsManager {

    private settingsList: {[key:string]:ISettings} = {};
    private db: FileDatabase;

    constructor(database: FileDatabase) {
        this.db = database;
        let settingImpl: ISettings[] = [database.getFileSaveConfig(), database.getDiscordConfig(), database.getWebDatabaseSettings(), database.getUploadConfig()];

        for(let setting of settingImpl){
            this.settingsList[setting.categoryName] = setting;
        }
        //log.debug(this.settingsList);
    }


    public updateSettings(settingModel: ISettings){
        this.settingsList[settingModel.categoryName] = settingModel;
        this.db.writeConfig(settingModel);
        getEventsDispatcher().dispatch({type: "settings_update", data: {settings: settingModel.categoryName}});
    }

    public getSettings(settingCategory: string) {
        if(this.settingsList[settingCategory] != null) {
            return this.settingsList[settingCategory];
        }
        return null;
    }

    public getRenderSettings(): settingFrame[] {
        let lister: settingFrame[] = [];
        Object.keys(this.settingsList).forEach(key => {
            let value = this.settingsList[key].getRenderingModel();
            lister.push(value);
        });
        return lister;
    }
}