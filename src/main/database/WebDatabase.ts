import {getEventsDispatcher, getSettingsManager, reloadWebDatabase} from "@main/main";
import {WebDatabaseSettings} from "@main/settings/WebDatabaseSettings";
import {notificationPackage} from "@main/Events";

const {Sequelize, Model} = require('sequelize');
const log = require('electron-log');


class Images extends Model {}
class Documents extends Model {}
class Records extends Model {}
class Containers extends Model {}
class RecordTags extends Model {}

export class WebDatabase {

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
            })
            .catch(err => {
                log.error('[SQLDatabase] Unable to connect to the database:', err);
            });
    }

    public eventListener(event: notificationPackage): void {
        if(event.type == "settings_update" && event.data['settings'] == "remotedb") {
            log.info("[Webdatabase] Listener Called - Reloading Remote Database");
            reloadWebDatabase();
        }
    }

    async matchAny(inputHash: string): Promise<boolean> {
        return this.matchImage(inputHash) || false;
    }

    async matchImage(inputHash: string): Promise<boolean> {
        let count = await Images.count({where: {md5: inputHash}});
        return count > 0;
    }


}