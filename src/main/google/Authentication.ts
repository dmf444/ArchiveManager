import {GoogleOauthSettings} from "@main/settings/GoogleOauthSettings";
import {getEventsDispatcher, getGoogleAuth, getSettingsManager} from "@main/main";
const {authenticate} = require('@google-cloud/local-auth');
import { google } from "googleapis";
import {OAuth2Client} from "google-auth-library/build/src/auth/oauth2client";
import {notificationPackage} from "@main/Events";
import log from "electron-log";

export class Authentication {

    private oAuth2Client: OAuth2Client;
    private SCOPES = [
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.labels'
    ];

    constructor() {
        getEventsDispatcher().register(this.eventListener);

        let settings = <GoogleOauthSettings> getSettingsManager().getSettings('googleapi');
        this.oAuth2Client = new google.auth.OAuth2(settings.getClientKey(), settings.getClientSecret(), "http://localhost");
        if(settings.getToken() != null) {
            // @ts-ignore
            this.oAuth2Client.setCredentials(settings.getToken());
        }
    }

    public eventListener = (event: notificationPackage) => {
        if(event.type == "settings_update" && event.data['settings'] == "googleapi") {
            log.info("[Google Downloader] Listener Called - Reloading Google Auth Settings");
            let settings = <GoogleOauthSettings> getSettingsManager().getSettings('googleapi');

            if (this.oAuth2Client._clientId != settings.getClientKey() || this.oAuth2Client._clientSecret != settings.getClientSecret()) {
                this.oAuth2Client = new google.auth.OAuth2(settings.getClientKey(), settings.getClientSecret(), "http://localhost");
            }
        }
    }


    public isAuthorized() {
        let settings = <GoogleOauthSettings> getSettingsManager().getSettings('googleapi');
        return settings.getToken() != null;
    }


    public createAuthUrl(): string {
        const authUrl = this.oAuth2Client.generateAuthUrl({access_type: 'offline', scope: this.SCOPES });
        console.log('Authorize this app by visiting this url:', authUrl);
        return authUrl;
    }

    public registerCode(code) {
        this.oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            this.oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            let settings = <GoogleOauthSettings> getSettingsManager().getSettings('googleapi');
            settings.setToken(token);
            getSettingsManager().updateSettings(settings);
        });
    }

    public getOauthClient() {
        return this.oAuth2Client;
    }

}