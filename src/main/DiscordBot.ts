import {Client, Message} from 'discord.js';
import {DiscordSettings} from "./settings/DiscordSettings";
import {notificationPackage} from "./Events";
import {getEventsDispatcher, getSettingsManager, reloadDiscordBot} from "./main";
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


            this.client.on('message', (msg: Message) => {
                if (msg.content === 'ping') {
                    msg.reply('pong');
                }
            });

            process.on('exit', () => {
                this.client.destroy();
            });


            this.client.login(this._settings.token);
            //'Njg5OTUwMzI1NzY3Mjc0NTYz.XnKUlQ.hz21x-kJNbaLHwHnJ1YA0y6Scgk'
        } else {
            log.warn("Discord Token not set, bot not Initialized!");
        }
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






