import {Client, Message} from 'discord.js';
import {DiscordSettings} from "./settings/DiscordSettings";
import {notificationPackage} from "./Events";
import {getEventsDispatcher, getFileManager, getSettingsManager, reloadDiscordBot} from "./main";
const log = require('electron-log');

export class Bot {

    private client: Client;
    private _settings: DiscordSettings;

    constructor() {
        this.client = new Client();
        this._settings = <DiscordSettings>getSettingsManager().getSettings("discord");
        getEventsDispatcher().register(this.eventListener);
    }

    public start(): void {
        log.info("Attempting to start discord bot");
        if(this._settings.token != null && this._settings.token != ""){

            this.client.on('ready', () => {
                log.info(`Logged in as ${this.client.user.tag}!`);
            });


            this.client.on('message', (msg) => {
                this.onNewMessageRecieved(msg);
            });

            process.on('exit', () => {
                this.client.destroy();
            });


            this.client.login(this._settings.token).catch(error => console.log(error));
            //'Njg5OTUwMzI1NzY3Mjc0NTYz.XnKUlQ.hz21x-kJNbaLHwHnJ1YA0y6Scgk'
        } else {
            log.warn("Discord Token not set, bot not Initialized!");
        }
    }

    public onNewMessageRecieved(msg: Message) {
        if(msg.channel.id == this._settings.channel_id) {
            let regex = /(https?|ftp):\/\/[^\s\/$.?#].[^\s]*/igm;
            let urls = msg.cleanContent.match(regex);
            if(urls != null) {
                for(let i = 0; i < urls.length; i++) {
                    let url: string = urls[i];
                    getFileManager().downloadFile(url, true);
                }
                msg.react(this._settings.icons_download);
            }
        }
    }

    public isOnline(): boolean {
        return this.client.user != null;
    }

    public reloadSettings(){
        if(this.client.user != null){
            this.client.destroy();
        }
        this._settings = <DiscordSettings>getSettingsManager().getSettings("discord");
        this.start();
    }

    public eventListener(event: notificationPackage): void {
        if(event.type == "settings_update" && event.data['settings'] == "discord") {
            log.info("[DiscordBot] Listener Called - Reloading Bot");
            reloadDiscordBot();
        }
    }

}






