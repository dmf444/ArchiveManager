import {notificationPackage} from "@main/Events";

export interface IWebDatabase {

    initDatabase(): void;

    eventListener(event: notificationPackage): void;

    isConnected(): boolean;

    matchAny(inputHash: string): Promise<boolean>;

    getAllTags(input?: string): Promise<string[]>;

    getContainers(): Promise<any[]>;
}