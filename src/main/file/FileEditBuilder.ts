import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {getFileDatabase, getFileUpdater} from "@main/main";
import {ipcMain} from 'electron';
const log = require('electron-log');

export class FileEditBuilder {

    private currentFile: FileModel;

    constructor(file: FileModel) {
        this.currentFile = file;
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

    public setContainer(containerId: number): FileEditBuilder {
        this.currentFile.fileMetadata.container = containerId;
        return this;
    }

    public addTag(tagString: string): FileEditBuilder {
        this.currentFile.fileMetadata.addTag(tagString);
        return this;
    }

    public removeTag(tagString: string): FileEditBuilder {
        this.currentFile.fileMetadata.removeTag(tagString);
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

    public commitFile() {
        getFileDatabase().updateFile(this.currentFile);
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
    getFileUpdater().setContainer(arg);
});