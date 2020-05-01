import {DiscordSettings} from "@main/settings/DiscordSettings";
import {FileSaveSettings} from "@main/settings/FileSaveSettings";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";
import {FileModel} from '@main/file/FileModel';

const log = require('electron-log');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');


export class FileDatabase {
    private database;

    constructor(filePath: string) {
        log.info(filePath);
        let adapter = new FileSync(filePath + '/appdb.json');
        //log.info("FileDB:" + filePath + '/appdb.json');
        this.database = low(adapter);
        this.database.defaults({ settings: {}, files: []}).write();
    }

    public addFile(file: FileModel) {
        let model = this.database.get('files').find({id: file.getId()});
        let modelValue = model.value();
        if(modelValue == null || modelValue == []) {
            this.database.get('files').push(file.toJson()).write();
        } else {
            model.assign(file.toJson()).write();
        }
    }

    public getFileById(id: number): FileModel {
        let model = this.database.get('files').find({id: id}).value();
        return FileModel.fromJson(model);
    }

    public getNextFreeFileId(): number{
        let highestModel = this.database.get('files').orderBy('id', 'desc').take(1);
        if(highestModel.size().value() != 0) {
            return highestModel.value()[0]['id'] + 1;
        } else {
            return 0;
        }
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