import {IWebDatabase} from "@main/database/IWebDatabase";
import {notificationPackage} from "@main/Events";
import {getEventsDispatcher, getSettingsManager, reloadWebDatabase} from "@main/main";
import log from "electron-log";
import {UploadSettings} from "@main/settings/UploadSettings";
import fetch from 'node-fetch';
import {Headers} from 'node-fetch';


export class WebDatabaseHttp implements IWebDatabase {
    private connected: boolean = false;
    private headers = null;
    private url = "";

    constructor() {
        this.initDatabase();
        getEventsDispatcher().register(this.eventListener);
    }

    eventListener(event: notificationPackage): void {
        if(event.type == "settings_update" && event.data['settings'] == "upload") {
            log.info("[WebdatabaseHTTP] Listener Called - Reloading HTTP config for Database");
            reloadWebDatabase();
        }
    }

    async initDatabase(): Promise<void> {
        let settings: UploadSettings = <UploadSettings>getSettingsManager().getSettings("upload");
        this.url = settings.getUrl();
        let header = new Headers();
        if(settings.getUsername() !== '') {
            header.append('Authorization', 'Basic ' + Buffer.from(`${settings.getUsername()}:${settings.getPassword()}`).toString('base64'));
        }
        this.headers = header;

        let finalResponse = await fetch(`${this.url}api/general/version.php`, {headers: this.headers});
        if(finalResponse.status === 200){
            let jsonResp = await finalResponse.json();
            if(jsonResp.success){
                log.info("[WebdatabaseHTTP] Connected to the webserver. Webserv Version: " + jsonResp.version);
                this.connected = true;
            }
        } else {
            log.warn("[WebdatabaseHTTP] Unable to connect to webserver API, returned status code " + finalResponse.status);
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    async matchAny(inputHash: string): Promise<boolean> {
        if(!this.isConnected()) {
            return false;
        }

        let finalResponse = await fetch(`${this.url}api/amintegration/hash_validation.php?hash=${inputHash}`, {method: 'GET', headers: this.headers});
        if(finalResponse.status === 200){
            let jsonResp = await finalResponse.json();
            if(jsonResp.success){
                return jsonResp.isUnique;
            }
        } else {
            log.warn("[WebdatabaseHTTP] Unable to get tags from webserver, returned status code " + finalResponse.status);
        }
        return false;
    }

    async getAllTags(input?: string): Promise<string[]> {
        if(!this.isConnected()) {
            return [];
        }

        let params = '';
        if(input != null) {
            params = `?hint=${input}`;
        }
        let finalResponse = await fetch(`${this.url}api/records/tags.php${params}`, {method: 'GET', headers: this.headers});
        if(finalResponse.status === 200){
            let jsonResp = await finalResponse.json();
            if(jsonResp.tagData != null){
                let tags = [];
                jsonResp.tagData.forEach((taginfo) => {
                    tags.push(taginfo.value);
                });
                return tags;
            }
        } else {
            log.warn("[WebdatabaseHTTP] Unable to get tags from webserver, returned status code " + finalResponse.status);
        }
        return [];
    }

    async getContainers(): Promise<any[]> {
        if(!this.isConnected()) {
            return [];
        }

        let finalResponse = await fetch(`${this.url}api/amintegration/list_containers.php`, {method: 'GET', headers: this.headers});
        if(finalResponse.status === 200){
            let jsonResp = await finalResponse.json();
            if(jsonResp.containers != null){
                return jsonResp.containers;
            }
        } else {
            log.warn("[WebdatabaseHTTP] Unable to get tags from webserver, returned status code " + finalResponse.status);
        }
        return [];
    }
}