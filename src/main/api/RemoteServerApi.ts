import {UploadSettings} from "@main/settings/UploadSettings";
import wretch, {Wretch} from "wretch";
import fetch from 'node-fetch';
import {getSettingsManager} from "@main/main";
import queryStringAddon, { QueryStringAddon } from "wretch/addons/queryString";
import type {BasicAuthAddon} from "wretch/addons/basicAuth";
import type {FormDataAddon} from "wretch/addons/formData";
import FormData from "formdata-node";
import log from "electron-log";
import basicAuth from "@main/api/BasicAuth";
import formData from "@main/api/FormData";


export default class RemoteServerApi {

    private apiUsername: string | null;
    private apiPassword: string | null;
    private baseApi: Wretch<FormDataAddon & QueryStringAddon & BasicAuthAddon> & FormDataAddon & QueryStringAddon & BasicAuthAddon;
    private token;

    constructor() {
        let settings = <UploadSettings>getSettingsManager().getSettings("upload");
        this.apiUsername = settings.getArchivesUsername();
        this.apiPassword = settings.getArchivesPassword();
        const baseUrl = settings.getUrl().slice(-1) === "/" ? settings.getUrl().slice(0, -1) : settings.getUrl();
        this.baseApi = wretch(baseUrl, { mode: "no-cors"}).polyfills({fetch: fetch, FormData: FormData}).addon(queryStringAddon).addon(basicAuth).addon(formData);
        if(settings.getUsername() !== '' || settings.getPassword() !== '') {
            this.baseApi = this.baseApi.basicAuth(settings.getUsername(), settings.getPassword());
        }
    }


    public getToken(): Promise<boolean> {
        return this.baseApi.url("/api/authentication/login.php").formData({username: this.apiUsername, motdepass: this.apiPassword}).post().res((jsonPayload) => {
            jsonPayload.text().then(data => console.log(data));
            if(jsonPayload.auth) {
                this.token = jsonPayload.token;
                return true;
            }
            return false;
        }).catch(err => {
            log.warn(err);
            return false;
        });
    }


    public async uploadFile(data: FormData) {
        if (this.token == null) await this.getToken();
        const queryParams = {
          endpoint: (data.get("desc_version") as string).startsWith("1") ? "image" : "document"
        };

        return this.baseApi.url("/api/upload.php").headers({ "X-ARCHIVES-AUTH": this.token, ...data.headers }).query(queryParams).body(data.stream).post().unauthorized(async (error, req) => {
            await this.getToken().catch(err => log.warn(err));
            return req.headers({ "X-ARCHIVES-AUTH": this.token }).post().unauthorized(err => log.warn(err)).json();
        }).json();
    }


    public async createGroup(groupName: string) {
        if (this.token == null) await this.getToken();
        const queryParams = { endpoint: "group" };

        return this.baseApi.url("/api/upload.php").headers({"X-ARCHIVES-AUTH": this.token}).query(queryParams).formData({group_name: groupName}).post().unauthorized(async (error, req) => {
            await this.getToken().catch(err => log.warn(err));
            return req.headers({ "X-ARCHIVES-AUTH": this.token }).post().unauthorized(err => log.warn(err)).json();
        }).json();
    }

}