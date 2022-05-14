import {DiscordSettings} from "@main/settings/DiscordSettings";
import {FileSaveSettings} from "@main/settings/FileSaveSettings";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";
import {FileModel} from '@main/file/FileModel';
import {FileState} from '@main/file/FileState';
import {UploadSettings} from "@main/settings/UploadSettings";
import {GoogleOauthSettings} from "@main/settings/GoogleOauthSettings";
import {GroupModel} from '@main/group/GroupModel';

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
        this.database.defaults({ settings: {}, uploadhist: [], downloadHistory: {}, files: [], groups: []}).write();
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

    //TODO: Add groups to this
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

    public addGroup(group: GroupModel) {
        let model = this.database.get('groups').find({id: group.id});
        let modelValue = model.value();
        if(modelValue == null || modelValue == []) {
            this.database.get('groups').push(group.toJson()).write();
        } else {
            model.assign(group.toJson()).write();
        }
    }

    public removeGroup(group: GroupModel) {
        this.database.get('groups').remove({id: group.id}).write();
    }

    public updateGroup(group: GroupModel) {
        this.database.get('groups').find({id: group.id}).assign(group.toJson()).write();
    }

    public getGroupById(id: number): GroupModel {
        let model = this.database.get('groups').find({id: id}).value();
        return GroupModel.fromJson(model);
    }

    public getNextFreeGroupId(): number{
        let highestModel = this.database.get('groups').orderBy('id', 'desc').take(1);
        if(highestModel.size().value() != 0) {
            return highestModel.value()[0]['id'] + 1;
        } else {
            return 0;
        }
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

    public addNewDownload(url: string, data) {
        let dataSpot = this.database.get('downloadHistory');
        if(dataSpot == null){
            this.database.push({downloadHistory: {}}).write();
        }
        dataSpot = this.database.get('downloadHistory').get(url);
        if(dataSpot.value() == null) {
            this.database.get('downloadHistory').set(url, data).write();
        } else {
            dataSpot.assign(data).write();
        }
    }

    public getAllDownloads() {
        let history = this.database.get('downloadHistory').value();
        if(history == null) return false;
        return history;
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

    public getGoogleConfig() : ISettings {
        let gos = new GoogleOauthSettings();
        return this.getSettingsOrDefault(gos);
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
