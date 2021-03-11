import {DiscordSettings} from "@main/settings/DiscordSettings";
import {FileSaveSettings} from "@main/settings/FileSaveSettings";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";
import {FileModel} from '@main/file/FileModel';
import {FileState} from '@main/file/FileState';
import {UploadSettings} from "@main/settings/UploadSettings";

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
        this.database.defaults({ settings: {}, uploadhist: [], files: []}).write();
    }

    public addFile(file: FileModel) {
        let model = this.database.get('files').find({id: file.id});
        let modelValue = model.value();
        if(modelValue == null || modelValue == []) {
            this.database.get('files').push(file.toJson()).write();
        } else {
            model.assign(file.toJson()).write();
        }
    }

    public removeFile(file: FileModel) {
        this.database.get('files').remove({id: file.id}).write();
    }

    public updateFile(file: FileModel) {
        this.database.get('files').find({id: file.id}).assign(file.toJson()).write();
    }

    public getFileById(id: number): FileModel {
        let model = this.database.get('files').find({id: id}).value();
        return FileModel.fromJson(model);
    }

    public getFileByUrl(url: string): FileModel {
        if(url == "" || url == null){
            return null;
        }
        let model = this.database.get('files').find({url: url}).value();
        return model == null ? null : FileModel.fromJson(model);
    }

    public getNextFreeFileId(): number{
        let highestModel = this.database.get('files').orderBy('id', 'desc').take(1);
        if(highestModel.size().value() != 0) {
            return highestModel.value()[0]['id'] + 1;
        } else {
            return 0;
        }
    }

    public getNewFiles(): FileModel[] {
        return this.database.get('files').filter(i => {
            return i.state == "NEW" || i.state == "ACCEPTED";
        }).value();
    }

    public getNonNewFiles(): FileModel[] {
        let a = this.database.get('files');
        let b = a.filter(i => {
            return i.state != "NEW" && i.state != "ACCEPTED";
        });
        return b.value();
    }

    public isFileUnique(md5Hash: string) {
        return this.database.get('files').filter(i => {
            return i.md5 == md5Hash;
        }).size().value() == 0;
    }

    public getAllFileCount(): number {
        return this.database.get('files').size().value();
    }

    public getErrorFileCount(): number {
        return this.database.get('files').filter(i => {
            return i.state == "ERROR" || i.state == "WARN";
        }).size().value();
    }

    public addNewUpload(data) {
        let dataSpot = this.database.get('uploadhist');
        if(dataSpot == null){
            this.database.push({uploadhist: []}).write();
        }
        dataSpot = this.database.get('uploadhist');
        dataSpot.push(data).write();
    }

    public getAllUploads() {
        if(this.database.get('uploadhist') == null) return [];
        return this.database.get('uploadhist').value();
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

    public getUploadConfig(): ISettings {
        let ups = new UploadSettings();
        return this.getSettingsOrDefault(ups);
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