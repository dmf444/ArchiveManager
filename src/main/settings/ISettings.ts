type settingValues = { id: string, value: string, size: number, name: string, type?: "text" | "password" };
type settingFrame = { id: string, category: string, settings: settingValues[]};

interface ISettings {

    categoryName: string;

    localizedName: string;

    getSettingsJson(): {};

    fromJson(jsonModel: {}): ISettings;

    getRenderingModel(): settingFrame;

    equals(settingImpl: {}): boolean;

}