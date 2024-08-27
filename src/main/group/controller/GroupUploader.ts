import {FileUploader} from "@main/FileUploader";
import {FileModel} from "@main/file/FileModel";
import {GroupModel} from "@main/group/models/GroupModel";
import fetch, {Headers} from 'node-fetch';
import FormData from "formdata-node";
import {getFileDatabase, getMainWindow} from "@main/main";
import jetpack from "fs-jetpack";
import RemoteServerApi from "@main/api/RemoteServerApi";
import log from "electron-log";


export class GroupUploader extends FileUploader {
    private group: GroupModel;
    private groupId: string;
    private failedFile: boolean;

    constructor(file: FileModel, remoteApi: RemoteServerApi, group: GroupModel) {
        super(file, remoteApi);
        this.group = group;
        this.failedFile = false;
    }

    public getGroupId(): string {
        return this.groupId;
    }

    public setGroupId(groupId: string): void {
        this.groupId = groupId;
    }

    public async preFlight(depth: number = 0) {
        if(depth === 3) {
            this.groupId = null;
            return;
        }

        try{
            const json = await this.remoteServerApi.createGroup(this.group.getName());
            if(json.uid == -1){
                this.groupId = null;
            }else {
                this.groupId = json.uid;
            }
        } catch (e) {
            log.error(e);
        }

        if(this.groupId == null) await this.preFlight(++depth);
        return this.groupId !== null;
    }

    protected parseResults(data) {
        let date = new Date();
        let uploadAttempt = { intid: `G${this.group.id}/${this.file.id}`, name: this.file.fileName, datetime: date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes() };
        let window = getMainWindow();

        if(data.success) {
            uploadAttempt['status'] = 'success';
            this.group.removeFileModel(this.file);
            jetpack.remove(this.file.savedLocation);
            getFileDatabase().updateGroup(this.group);
            if(window != null) window.webContents.send('status_update', 1);
        } else {
            uploadAttempt['status'] = 'reject';
            uploadAttempt['errors'] = data.message;
            if(window != null) window.webContents.send('status_update', 0);
            this.failedFile = true;
        }
        getFileDatabase().addNewUpload(uploadAttempt);
    }

    protected getGroup(): string {
        return this.groupId;
    }

    public hasFailedFile(){
        return this.failedFile;
    }


}