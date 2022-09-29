import React from "react";
import {GroupEditor} from "@/renderer/components/group/GroupEditor";
import {GroupModel} from "@main/group/models/GroupModel";
import {ipcRenderer} from "electron";


type groupState = {
    isUploading: boolean,
    group: GroupModel,
    editingFile: number
}
export class Group extends React.Component<{ insHeader: any }, groupState> {

    state = {
        isUploading: false,
        group: null,
        editingFile: null
    }

    constructor(props) {
        super(props);

        this.updateGroup = this.updateGroup.bind(this);
        ipcRenderer.on('group_get_content_reply', this.updateGroup);
    }

    componentDidMount(): void {
        ipcRenderer.send('group_get_content', 0);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('group_get_content_reply', this.updateGroup);
    }

    updateGroup(event, args: GroupModel){
        let group = new GroupModel(-1, '', -1, -1, -1, [], '', []);
        Object.assign(group, args);
        this.setState({group: group});
    }

    public shouldShowGroup() {
        return this.state.group != null && !this.state.isUploading && this.state.editingFile == null;
    }

    public render() {
        return (
            <div>
                {this.shouldShowGroup() && <GroupEditor groupModel={this.state.group} insHeader={this.props.insHeader}/>}
            </div>
        );
    }
}