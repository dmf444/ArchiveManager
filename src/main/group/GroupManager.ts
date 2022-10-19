import {getDescriptionReader, getFileDatabase, getFileManager, getMainWindow} from "@main/main";
import {GroupModel} from "@main/group/models/GroupModel";
import jetpack from "fs-jetpack";
import {FileUtils} from "@main/downloader/FileUtils";
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {FileUploadData} from "@main/file/FileUploadData";
import * as path from "path";
import log from "electron-log";
import {GroupUploader} from "@main/group/controller/GroupUploader";


type GroupImportType = {
    type: "grouped" | "individual",
    path: string,
    files: {fileName: string, filePath: string, relativePath: string}[]
}

export class GroupManager {

    public static importGroup(groupInfo: GroupImportType){
        if (groupInfo.type == "individual") {
            groupInfo.files.forEach((file) => {
                getFileManager().addFileFromLocal(file.filePath, file.fileName);
            });
        } else {
            // Create Group
            let group = this.createGroup(groupInfo.path);
            //Move Folder to Staging area
            const newFolderName = `g${ group.id }_${ group.getName() }`;
            jetpack.move(groupInfo.path, FileUtils.getFilePath(false) + newFolderName);
            const absPath = FileUtils.getFilePath(false) + newFolderName + path.sep;
            group.setRootFolder(absPath);
            // Create FileModel for each subfile
            let id = 0;
            groupInfo.files.forEach((file) => {
                let filePath = absPath + file.fileName;
                let hash: string = FileUtils.getFileHash(filePath);
                let metadata: FileUploadData = FileUploadData.fromJson(null);
                metadata.restrictions = 1;
                group.addFileModel(new FileModel(id, file.fileName, filePath, FileState.NEW, '', hash, metadata));
                id++;
            });
            //Save to database
            getFileDatabase().addGroup(group);
        }
    }

    private static createGroup(path: string) {
        let nextGroupId: number = getFileDatabase().getNextFreeGroupId();
        let name = 'Group ' + nextGroupId;
        if(path.includes("\\")) {
            let splitPath = path.split('\\');
            if(path.endsWith("\\") && splitPath.length > 1) {
                name = splitPath[splitPath.length - 2];
            } else {
                name = splitPath[splitPath.length - 1];
            }
        }
        return new GroupModel(nextGroupId, name, null, null, 1, [], '', [], '', null);
    }

    public static deleteGroup(group: GroupModel, removeFolder: boolean = false) {
        log.info(`Deleting Group: ${group.getName()} with id: ${group.id}. Folder removal: ${removeFolder}`);
        if(removeFolder) {
            jetpack.remove(group.getRootFolder())
        }
        getFileDatabase().removeGroup(group);
    }

    public static async uploadGroup(group: GroupModel) {
        let window = getMainWindow();

        let deleteGroup = true;
        if(window != null) window.webContents.send('group_upload_start', group.getFiles().length);

        for (const file of group.getFiles()) {

            let mergedFile = this.mergeGroupData(group, file);
            if(mergedFile == null) {
                //don't upload, don't delete file.
                deleteGroup = false;
                if(window != null) window.webContents.send('status_update', 2);
                continue;
            }

            let uploader = new GroupUploader(mergedFile, group);
            if (group.getGroupId() === null) {
                let groupMade = await uploader.preFlight();
                if(!groupMade) {
                    deleteGroup = false;
                    let date = new Date();
                    let uploadAttempt = { intid: `G${group}`, name: `this.file.fileName`, datetime: date.toLocaleDateString() + " " + date.getHours() + ":" + date.getMinutes(), errors: ['Unable to create group id'], status: 'reject' };
                    getFileDatabase().addNewUpload(uploadAttempt);
                    if(window != null) window.webContents.send('status_update', -1);
                    break;
                }
                group.setGroupId(uploader.getGroupId());
                getFileDatabase().updateGroup(group);
            }
            uploader.setGroupId(group.getGroupId());

            uploader.upload();


        }

        if(deleteGroup) {
            GroupManager.deleteGroup(group);
        }
    }

    private static mergeGroupData(group: GroupModel, file: FileModel): FileModel | null {
        if(file.fileMetadata.date == "") {
            file.fileMetadata.date = group.getYear();
        }

        if(file.fileMetadata.container == null) {
            file.fileMetadata.container = group.getContainer();
        }

        if(file.fileMetadata.restrictions == null || file.fileMetadata.restrictions == 1) {
            file.fileMetadata.restrictions = group.getRestriction();
        }

        file.fileMetadata.tags.concat(group.getTags());

        let sub = file.savedLocation.lastIndexOf('.');
        let desc = getDescriptionReader().getDefaultVersion(file.savedLocation.substring(sub))
        if(desc == null && file.state == FileState.NEW) {
            return null;
        } else {
            if(file.fileMetadata.descriptionVersion == null) {
                file.fileMetadata.descriptionVersion = desc[0];
                let jsonMap = {};

                desc[1].fields.forEach((key, value) => {
                    if(value == 'text' || value == 'textarea') {
                        jsonMap[key] = ''
                    } else if(value == 'select') {
                        jsonMap[key] = []
                    }
                });
                if(jsonMap['description'] == '') {
                    jsonMap['description'] = group.getDescription();
                }
                file.fileMetadata.description = JSON.stringify(jsonMap);
            } else {
                let data = JSON.parse(file.fileMetadata.description);
                if('description' in data && data['description'] == '') {
                    data['description'] = group.getDescription();
                    file.fileMetadata.description = JSON.stringify(data);
                }
            }
        }

        return file;
    }

}