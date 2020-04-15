import {DiscordSettings} from "@main/settings/DiscordSettings";
import {FileSaveSettings} from "@main/settings/FileSaveSettings";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";

const log = require('electron-log');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

export type FileModel = { id: string, category: string, settings: settingValues[]};

export class FileDatabase {
    private database;

    constructor(filePath: string) {
        log.info(filePath);
        let adapter = new FileSync(filePath + '/appdb.json');
        //log.info("FileDB:" + filePath + '/appdb.json');
        this.database = low(adapter);
        this.database.defaults({ settings: {}, files: []}).write();
    }

    public getDiscordConfig() : ISettings {
        let fss = new DiscordSettings();
        return this.getSettingsOrDefault(fss);
    }

    public getWebDatabaseSettings(): ISettings {
        let wds = new WebDatabaseSettings();
        return this.getSettingsOrDefault(wds);
    }


    public getFileSaveConfig(): ISettings {
        let fss = new FileSaveSettings();
        return this.getSettingsOrDefault(fss);
    }

    private getSettingsOrDefault(settingImpl: ISettings): ISettings {
        let values = this.database.get("settings").get(settingImpl.categoryName).value();
        if(values != null) {
            return settingImpl.fromJson(values);
        } else {
            return settingImpl;
        }
    }

    public writeConfig(config: ISettings): void {
        this.database.get("settings").set(config.categoryName, config.getSettingsJson()).write();
    }



}