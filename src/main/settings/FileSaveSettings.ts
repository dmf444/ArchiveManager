const { app } = require('electron');

export class FileSaveSettings implements ISettings{
    get stagingPath(): string {
        return this._stagingPath;
    }
    get processingPath(): string {
        return this._processingPath;
    }
    categoryName: string;
    localizedName: string;

    private _stagingPath: string;
    private _processingPath: string;

    constructor() {
        this.categoryName = "save";
        this.localizedName = "Save Settings";
        this._stagingPath = app.getPath('temp');
        this._processingPath = app.getPath('documents') + "\\smcs_archiver\\";
    }

    public getSettingsJson(): {} {
        return {
            staging_path: this._stagingPath,
            processing_path: this._processingPath
        };
    }

    public fromJson(jsonModel: {}): ISettings {
        this._processingPath = jsonModel['processing_path'];
        this._stagingPath = jsonModel["staging_path"];
        return this;
    }

    public getRenderingModel(): settingFrame {
        return {
            id: this.categoryName,
            category: this.localizedName,
            settings: [
                {id: 'staging_path', value: this._stagingPath, size: 12, name: "Staging Files Path"},
                {id: 'processing_path', value: this._processingPath, size: 12, name: "Downloaded File Path"}
            ]
        }
    }

    equals(settingImpl: {}): boolean {
        let setting: FileSaveSettings = <FileSaveSettings>new FileSaveSettings().fromJson(settingImpl);
        return setting._stagingPath === this._stagingPath &&
            setting._processingPath === this._processingPath;
    }

}

