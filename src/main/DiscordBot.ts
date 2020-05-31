import {Client, Message, MessageReaction, User} from 'discord.js';
import {DiscordSettings} from "./settings/DiscordSettings";
import {notificationPackage} from "./Events";
import {getEventsDispatcher, getFileDatabase, getFileManager, getSettingsManager, reloadDiscordBot} from "./main";
import {FileModel} from "@main/file/FileModel";
import {FileUtils} from "@main/downloader/FileUtils";
import {FileEditBuilder} from "@main/file/FileEditBuilder";

const log = require('electron-log');

export class Bot {

    private client: Client;
    private _settings: DiscordSettings;

    constructor() {
        this.client = new Client({ partials: ['MESSAGE', 'REACTION'] });
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

            this.client.on('messageReactionAdd', (reaction: MessageReaction, user: User) => {
                this.onEmojiAdded(reaction, user);
            })

            process.on('exit', () => {
                this.client.destroy();
            });


            this.client.login(this._settings.token).catch(error => console.log(error));
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

    public async onEmojiAdded(reaction: MessageReaction, user: User) {
        if (reaction.partial) {
            await reaction.fetch();
        }
        if(reaction.message.channel.id == this._settings.channel_id) {
            let userIds = this._settings.authorizedUsers;
            if(userIds.includes(user.id)) {
                log.info(reaction.emoji.toString(), reaction.emoji.toString() == this._settings.icons_download)
                if(reaction.emoji.toString() == this._settings.icons_accept) {
                    let urls: string[] = this.parseUrls(reaction.message.cleanContent);
                    urls.forEach((url:string) => {
                       let file: FileModel = getFileDatabase().getFileByUrl(url);
                       if(file != null) {
                           getFileManager().moveFileToIngest(file);
                       }
                    });
                } else if(reaction.emoji.toString() == this._settings.icons_refuse) {
                    let urls: string[] = this.parseUrls(reaction.message.cleanContent);
                    urls.forEach((url:string) => {
                        let file: FileModel = getFileDatabase().getFileByUrl(url);
                        if(file != null) {
                            getFileManager().removeFileById(file.id);
                        }
                    });
                } else if(reaction.emoji.toString() == this._settings.icons_download) {
                    let urls: string[] = this.parseUrls(reaction.message.cleanContent);
                    urls.forEach((url:string) => {
                        let file: FileModel = getFileDatabase().getFileByUrl(url);
                        if(file == null){
                            getFileManager().downloadFile(url, false);
                        }
                    });
                }
            }
        }
    }

    public parseUrls(messageString: string) {
        let regex = /(https?|ftp):\/\/[^\s\/$.?#].[^\s]*/igm;
        return messageString.match(regex);
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






