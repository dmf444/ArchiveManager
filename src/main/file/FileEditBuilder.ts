import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {getFileDatabase, getFileUpdater} from "@main/main";
import {ipcMain} from 'electron';
import {FileUtils} from "@main/downloader/FileUtils";
import {GroupModel} from "@main/group/models/GroupModel";

const log = require('electron-log');

export class FileEditBuilder {

    private currentFile: FileModel;
    private groupParent: GroupModel;
    private fileAdded: boolean = false;

    constructor(file: FileModel, groupParent: GroupModel = null) {
        this.currentFile = file;
        this.groupParent = groupParent;
    }


    public setNormalState(): FileEditBuilder {
        this.currentFile.state = FileState.NORMAL;
        return this;
    }

    public setLocalName(newName: string): FileEditBuilder {
        this.currentFile.fileMetadata.localizedName = newName;
        return this;
    }

    public setDescription(desc: string): FileEditBuilder {
        this.currentFile.fileMetadata.description = desc;
        return this;
    }

    public setDescriptionVersion(version: string): FileEditBuilder {
        this.currentFile.fileMetadata.descriptionVersion =version;
        return this;
    }

    public setContainer(containerId: number): FileEditBuilder {
        this.currentFile.fileMetadata.container = containerId;
        return this;
    }

    public setTags(tagStrings: string[]): FileEditBuilder {
        this.currentFile.fileMetadata.tags = tagStrings;
        return this;
    }

    public setRestriction(restriction: number): FileEditBuilder {
        this.currentFile.fileMetadata.restrictions = restriction;
        return this;
    }

    public setPageCount(page: number): FileEditBuilder {
        this.currentFile.fileMetadata.pageCount = page;
        return this;
    }

    public setDate(date: string): FileEditBuilder {
        this.currentFile.fileMetadata.date = date;
        return this;
    }

    public setExtraFilePath(path: string): FileEditBuilder {
        this.currentFile.fileMetadata.extraFile = path;
        this.fileAdded = true;
        return this;
    }

    public clearExtraFilePath() {
        this.currentFile.fileMetadata.extraFile = "";
        return this;
    }

    public commitFile() {
        if(this.fileAdded) {
            this.currentFile.fileMetadata.extraFile = FileUtils.moveFileByPath(this.currentFile.fileMetadata.extraFile);
            this.fileAdded = false;
        }
        if(this.groupParent == null) {
            getFileDatabase().updateFile(this.currentFile);
        } else {
            this.groupParent.replaceFileModel(this.currentFile);
            getFileDatabase().updateGroup(this.groupParent);
        }
    }
}

ipcMain.on('file_edit_notnew', function (event, arg) {
    getFileUpdater().setNormalState();
});

ipcMain.on('file_edit_name', function (event, arg) {
    getFileUpdater().setLocalName(arg);
});

ipcMain.on('file_edit_page_count', function (event, arg) {
    getFileUpdater().setPageCount(arg);
});

ipcMain.on('file_edit_restriction', function (event, arg) {
    getFileUpdater().setRestriction(arg);
});

ipcMain.on('file_edit_date', function (event, arg) {
    getFileUpdater().setDate(arg);
});

ipcMain.on('file_edit_container', function (event, arg) {
    log.info(arg);
    getFileUpdater().setContainer(arg);
});

ipcMain.on('file_edit_description', function (event, arg) {
    getFileUpdater().setDescription(arg);
});

ipcMain.on('file_edit_desc_version', function (event, arg) {
    getFileUpdater().setDescriptionVersion(arg);
});

ipcMain.on('file_edit_tags', function (event, arg: string[]) {
    getFileUpdater().setTags(arg);
});

ipcMain.on('file_edit_extraFile', function (event, arg: string) {
    getFileUpdater().setExtraFilePath(arg);
});

ipcMain.on('file_edit_eFRemove', function (event, arg: string) {
    getFileUpdater().clearExtraFilePath();
});