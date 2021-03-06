import * as jetpack from "fs-jetpack";
import {app} from "electron";
const path = require('path');
const log = require('electron-log');

type descType = {name: string, fields};
type writtenFileContent = {name: string, version: string, fields};
export class DescriptionFileReader {

    private versions: Map<string, descType>;

    public initializeFolder(filePath: string) {
        let descFolderPath: string = filePath + path.sep + "desc_versions";
        log.info(descFolderPath);
        if(jetpack.exists(descFolderPath) !== "dir") {
            jetpack.dir(descFolderPath);
            jetpack.file(descFolderPath + path.sep + "default_0_0_0.json", {content: {name: "Null", version: "0.0.0", fields: null}, jsonIndent: 4});

        }
        this.readFiles();
    }


    public readFiles() {
        let filePath = app.getPath('userData');
        let descFolderPath: string = filePath + path.sep + "desc_versions";
        this.versions = new Map<string, descType>();

        let fileNames: string[] = jetpack.list(descFolderPath);
        fileNames.forEach(fileName => {
            let content: writtenFileContent = jetpack.read(descFolderPath + path.sep + fileName, 'json');
            this.versions.set(content.version, {name: content.version + " (" + content.name + ")", fields: content.fields});
        });
    }

    public getDescriptionContent(version: string) {
        if(this.versions.has(version)){
            return this.versions.get(version).fields;
        }
        return null;
    }

    public getAllVersions() {
        let keys = this.versions.keys();
        let responseArray = [];

        let iteration = keys.next();
        while (iteration.done != true) {
            let test = this.versions.get(iteration.value);
            responseArray.push({version: iteration.value, name: test.name});

            iteration = keys.next();
        }
        return responseArray;
    }

}