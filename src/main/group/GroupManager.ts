import {getFileDatabase, getFileManager} from "@main/main";
import {GroupModel} from "@main/group/models/GroupModel";
import jetpack from "fs-jetpack";
import {FileUtils} from "@main/downloader/FileUtils";
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {FileUploadData} from "@main/file/FileUploadData";
import {mergeDefaults} from "sequelize/types/lib/utils";
import * as path from "path";


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
            const absPath = FileUtils.getFilePath(false) + newFolderName + path.sep
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
        return new GroupModel(nextGroupId, name, null, null, 1, [], '', []);
    }

}