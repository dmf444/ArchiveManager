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
import {IDownloader} from "@main/downloader/interfaces/IDownloader";
import RemoteServerApi from "@main/api/RemoteServerApi";
import {UploadResultStatusType} from "@main/database/LocalDatabase";
import {sendSuccess} from "@main/NotificationBundle";


type GroupImportType = {
    type: "grouped" | "individual",
    path: string,
    files: {fileName: string, filePath: string, relativePath: string}[]
}

export class GroupManager {

    public static async importGroup(groupInfo: GroupImportType, downloader?: IDownloader) {
        if (groupInfo.type == "individual") {
            groupInfo.files.forEach((file) => {
                getFileManager().addFileFromLocal(file.filePath, file.fileName);
            });
        } else {
            // Create Group
            let group = this.createGroup(groupInfo.path);
            //Move Folder to Staging area
            const newFolderName = `g${group.id}_${group.getName()}`;
            if (groupInfo.path.startsWith(FileUtils.getFilePath(false))) {
                jetpack.copy(groupInfo.path, FileUtils.getFilePath(false) + newFolderName);
            } else {
                jetpack.move(groupInfo.path, FileUtils.getFilePath(false) + newFolderName);
            }
            const absPath = FileUtils.getFilePath(false) + newFolderName + path.sep;
            group.setRootFolder(absPath);
            // Create FileModel for each subfile
            let id = 0;
            for (const file of groupInfo.files) {
                let filePath = absPath + file.fileName;
                let hash: string = await FileUtils.getFileHash(filePath);
                let metadata: FileUploadData = FileUploadData.fromJson(null);
                metadata.restrictions = 1;
                let fileModel = new FileModel(id, file.fileName, filePath, FileState.NEW, '', hash, metadata);
                if (downloader) {
                    downloader.createdFilePostback(fileModel);
                }
                group.addFileModel(fileModel);
                id++;
            }
            //Save to database
            getFileDatabase().addGroup(group);
            sendSuccess("Group Import Completed", "Successfully imported group folder.");
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
            jetpack.remove(group.getRootFolder());
        }
        getFileDatabase().removeGroup(group);
    }

    public static async uploadGroup(group: GroupModel) {
        let window = getMainWindow();

        let deleteGroup = true;
        if(window != null) window.webContents.send('group_upload_start', group.getFiles().length);
        let api = new RemoteServerApi();
        let valid = await api.getToken();

        for (const file of group.getUploadSortedFiles()) {

            let mergedFile = this.mergeGroupData(group, file);
            if(mergedFile == null) {
                //don't upload, don't delete file.
                deleteGroup = false;
                if(window != null) window.webContents.send('status_update', 2);
                continue;
            }

            let uploader = new GroupUploader(mergedFile, api, group);
            if (group.getGroupId() == null) {
                let groupMade = await uploader.preFlight();
                if(!groupMade) {
                    deleteGroup = false;
                    let date = new Date();
                    let uploadAttempt: UploadResultStatusType = {
                        intid: `G${group.id}`,
                        name: `this.file.fileName`,
                        datetime: `${date.toLocaleDateString()} ${date.getHours()}:${date.getMinutes()}`,
                        errors: ['Unable to create group id'],
                        status: 'failure'
                    };
                    getFileDatabase().addNewUpload(uploadAttempt);
                    if(window != null) window.webContents.send('status_update', -1);
                    break;
                }
                group.setGroupId(uploader.getGroupId());
                getFileDatabase().updateGroup(group);
            }
            uploader.setGroupId(group.getGroupId());

            await uploader.upload();

            if(uploader.hasFailedFile()) {
                deleteGroup = false;
                if(window != null) window.webContents.send('status_update', -1);
                break;
            }
        }

        if(deleteGroup) {
            GroupManager.deleteGroup(group, true);
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

        file.fileMetadata.tags = file.fileMetadata.tags.concat(group.getTags());

        let sub = file.savedLocation.lastIndexOf('.');
        let desc = getDescriptionReader().getDefaultVersion(file.savedLocation.substring(sub + 1))
        if(desc == null && file.state == FileState.NEW) {
            return null;
        } else {
            if(file.fileMetadata.descriptionVersion == null) {
                let jsonMap = {};

                for(let [key, value] of Object.entries(desc[1].fields)) {
                    if(value == 'text' || value == 'textarea') {
                        jsonMap[key] = ''
                    } else if(value == 'select') {
                        jsonMap[key] = []
                    }
                }
                if(jsonMap['description'] == '') {
                    jsonMap['description'] = group.getDescription();
                }
                file.fileMetadata.description = JSON.stringify(jsonMap);
                file.fileMetadata.descriptionVersion = desc[0];

            } else {
                let fields = getDescriptionReader().getDescriptionContent(file.fileMetadata.descriptionVersion);
                let data = JSON.parse(file.fileMetadata.description);
                if('description' in data && data['description'] == '') {
                    data['description'] = group.getDescription();
                    file.fileMetadata.description = JSON.stringify(data);
                } else if('description' in fields) {
                    data['description'] = group.getDescription();
                    file.fileMetadata.description = JSON.stringify(data);
                }
            }
        }

        return file;
    }

}
