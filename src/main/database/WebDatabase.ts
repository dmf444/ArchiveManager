import {getEventsDispatcher, getSettingsManager, reloadWebDatabase} from "@main/main";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";
import {notificationPackage} from "@main/Events";


const {Sequelize, Model, Op} = require('sequelize');
const log = require('electron-log');


class Images extends Model {}
class Documents extends Model {}
class Records extends Model {}
class Containers extends Model {}
class Tags extends Model {
    public id!: number;
    public unique_tag!: string;
    public tag!: string;

}

export class WebDatabase {

    private connected: boolean = false;

    constructor() {
        this.initDatabase();
        getEventsDispatcher().register(this.eventListener);
    }

    public initDatabase(): void {
        let settings: WebDatabaseSettings = <WebDatabaseSettings>getSettingsManager().getSettings("remotedb");
        const sequelize = new Sequelize(settings.databaseName, settings.username, settings.password, {
            host: settings.hostAddr,
            dialect: 'mariadb'
        });
        sequelize.authenticate()
            .then(() => {
                log.info('[SQLDatabase] Connection has been established successfully.');
                this.connected = true;
                Images.init({
                    // attributes
                    id: {
                        type: Sequelize.INTEGER,
                        autoIncrement: true,
                        primaryKey: true,
                        allowNull: false
                    },
                    name: {
                        type: Sequelize.STRING(500),
                        allowNull: false
                    },
                    save_location: {
                        type: Sequelize.STRING(1023),
                        allowNull: false
                    },
                    save_name: {
                        type: Sequelize.STRING(255),
                        allowNull: false
                    },
                    image_location: {
                        type: Sequelize.STRING(1023),
                        allowNull: false
                    },
                    description: {
                        type: Sequelize.STRING(500),
                        allowNull: false
                    },
                    restriction: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    container: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    md5: {
                        type: Sequelize.STRING(32),
                        allowNull: false
                    }
                }, {
                    sequelize,
                    modelName: 'images'
                    // options
                });
                Containers.init({
                    id: {
                        type: Sequelize.INTEGER,
                        autoIncrement: true,
                        primaryKey: true,
                        allowNull: false
                    },
                    name: {
                        type: Sequelize.STRING(100),
                        allowNull: false
                    },
                    code: {
                        type: Sequelize.STRING(10),
                        allowNull: false
                    }
                }, {
                   sequelize,
                   modelName: 'containers'
                });
                Documents.init({
                    id: {
                        type: Sequelize.INTEGER,
                        autoIncrement: true,
                        primaryKey: true,
                        allowNull: false
                    },
                    name: {
                        type: Sequelize.STRING(255),
                        allowNull: false
                    },
                    image: {
                        type: Sequelize.TEXT,
                        allowNull: false
                    },
                    download_url: {
                        type: Sequelize.TEXT,
                        allowNull: false
                    },
                    mimeType: {
                        type: Sequelize.STRING(32)
                    },
                    restriction: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    },
                    md5: {
                        type: Sequelize.STRING(32),
                        allowNull: false
                    },
                    doc_box: {
                        type: Sequelize.INTEGER,
                        allowNull: false
                    }
                }, {
                    sequelize,
                    modelName: 'digital_documents'
                });
                Tags.init({
                    id: {
                        type: Sequelize.INTEGER,
                        autoIncrement: true,
                        primaryKey: true,
                        allowNull: false
                    },
                    tag: {
                        type: Sequelize.STRING(100),
                        allowNull: false
                    },
                    unique_tag: {
                        type: Sequelize.STRING(100),
                        allowNull: false
                    }
                }, {
                    sequelize,
                    modelName: 'tags'
                });
            })
            .catch(err => {
                this.connected = false;
                log.error('[SQLDatabase] Unable to connect to the database:', err['name']);
            });
    }

    public eventListener(event: notificationPackage): void {
        if(event.type == "settings_update" && event.data['settings'] == "remotedb") {
            log.info("[Webdatabase] Listener Called - Reloading Remote Database");
            reloadWebDatabase();
        }
    }

    public isConnected(): boolean {
        return this.connected;
    }

    async matchAny(inputHash: string): Promise<boolean> {
        return await this.matchImage(inputHash) || this.matchDocument(inputHash);
    }

    async matchImage(inputHash: string): Promise<boolean> {
        let count = await Images.count({where: {md5: inputHash}});
        return count > 0;
    }

    async matchDocument(inputHash: string): Promise<boolean> {
        let count = await Documents.count({where: {md5: inputHash}});
        return count > 0;
    }

    async getAllTags(input?: string): Promise<string[]> {
        if(!this.isConnected()){
            return null;
        }


        let option = {attributes: ['tag']};
        if(input != null) {
            option["where"] = {tag: {[Op.substring]: input}};
        }

        let tags = await Tags.findAll(option);
        let tagList: string[] = [];
        tags.every(tag => tagList.push(tag.tag));
        return tagList;
    }

    async getContainers(): Promise<any[]> {
        if(!this.isConnected()){
            return null;
        }

        let containers = await Containers.findAll();

        let containerReply = [];
        containers.every(container => containerReply.push({id: container.id, name: container.name}));
        return containerReply;
    }

}