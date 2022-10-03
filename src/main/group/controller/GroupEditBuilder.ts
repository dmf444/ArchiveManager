import {GroupModel} from '@main/group/models/GroupModel';
import {getFileDatabase, getFileUpdater, getGroupUpdater} from '@main/main';
import {ipcMain} from 'electron';

export class GroupEditBuilder {
    private group: GroupModel;

    constructor(group: GroupModel) {
        this.group = group;
    }


    public setName(name: string): GroupEditBuilder {
        this.group.name = name;
        return this;
    }

    public setYear(year: string): GroupEditBuilder {
        this.group.setYear(year);
        return this;
    }

    public setContainer(container: number): GroupEditBuilder {
        this.group.setContainer(container);
        return this;
    }

    public setRestriction(restriction: number): GroupEditBuilder {
        this.group.setRestriction(restriction);
        return this;
    }

    public setDescription(desc: string): GroupEditBuilder {
        this.group.setDescription(desc);
        return this;
    }

    public setTags(tags: string[]): GroupEditBuilder {
        this.group.setTags(tags);
        return this;
    }


    public commit() {
        getFileDatabase().updateGroup(this.group);
    }
}

ipcMain.on('group_edit_tags', function (event, arg: string[]) {
    getGroupUpdater().setTags(arg);
});

ipcMain.on('group_edit_restriction', function (event, arg: number) {
    getGroupUpdater().setRestriction(arg);
});

ipcMain.on('group_edit_description', function (event, arg: string) {
    getGroupUpdater().setDescription(arg);
});

ipcMain.on('group_edit_container', function (event, arg: number) {
    getGroupUpdater().setContainer(arg);
});

ipcMain.on('group_edit_date', function (event, arg: string) {
    getGroupUpdater().setYear(arg);
});

ipcMain.on('group_edit_name', function (event, arg: string) {
    getGroupUpdater().setName(arg);
});
