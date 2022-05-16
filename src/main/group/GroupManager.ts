

type GroupImportType = {
    type: "grouped" | "individual",
    path: string,
    files: {fileName: string, filePath: string, relativePath: string}[]
}

export class GroupManager {

    public static createGroup(groupInfo: GroupImportType){

    }

}