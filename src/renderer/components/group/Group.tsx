import React from "react";
import {GroupEditor} from "@/renderer/components/group/GroupEditor";
import {GroupModel} from "@main/group/models/GroupModel";
import {ipcRenderer} from "electron";
import {FileInfo} from "@/renderer/components/files/FileInfo";
import {FileModel} from "@main/file/FileModel";


type groupState = {
    isUploading: boolean,
    group: GroupModel,
    editingFile: FileModel
}
type groupProps = {
    insHeader: (headerContent: React.ReactNode) => void,
    groupId: number,
    openFilePage: () => void
}
export class Group extends React.Component<groupProps, groupState> {

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
        ipcRenderer.send('group_get_content', this.props.groupId);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('group_get_content_reply', this.updateGroup);
    }

    updateGroup(event, args: GroupModel){
        let group = new GroupModel(-1, '', '', -1, -1, [], '', []);
        Object.assign(group, args);
        this.setState({group: group});
    }

    closeFileAndUpdate = () => {
        ipcRenderer.send('file_edit_save');
        ipcRenderer.send('group_get_content', this.props.groupId);
        this.setState({editingFile: null});
    }

    openFileAndChangePage = (file: FileModel, callback) => {
        ipcRenderer.send('file_edit_start', [this.props.groupId, file.id]);
        this.setState({editingFile: file});
    }

    public shouldShowGroup() {
        return this.state.group != null && !this.state.isUploading && this.state.editingFile == null;
    }

    public render() {
        return (
            <div>
                {this.shouldShowGroup() && <GroupEditor groupModel={this.state.group} insHeader={this.props.insHeader} openFilePage={this.props.openFilePage} openFileEditor={this.openFileAndChangePage}/>}
                { this.state.editingFile != null && <FileInfo infoClose={this.closeFileAndUpdate} insertHeaderFunc={this.props.insHeader} editingCard={this.state.editingFile} grouped={true} /> }
            </div>
        );
    }
}
