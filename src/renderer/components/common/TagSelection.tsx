import React from "react";
import {Form, Select} from "antd";
import {ipcRenderer} from "electron";
import {FileState} from "@main/file/FileState";
const { Option } = Select;



export class TagSelection extends React.Component<{ ipcSendEventName: string }, { tagOptions: string[]}> {

    public static defaultProps = {
        ipcSendEventName: "file_edit_tags"
    }

    constructor(props) {
        super(props);
        this.state = {
            tagOptions: []
        };

        this.setTagOptions = this.setTagOptions.bind(this);
        ipcRenderer.on('file_edit_get_tags_reply', this.setTagOptions);
    }

    componentDidMount(): void {
        ipcRenderer.send('file_edit_get_tags', null);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('file_edit_get_tags_reply', this.setTagOptions);
    }

    setTagOptions(event, args: string[]){
        this.setState({tagOptions: args});
    }

    private tagGetTimer = null;
    searchTags = (value: string) => {
        clearTimeout(this.tagGetTimer);
        this.tagGetTimer = setTimeout(this.sendTagSearch, 300, value);
    }

    sendTagSearch = (value) => {
        ipcRenderer.send('file_edit_get_tags', value);
    };

    sendTagChange = (changed, all) => {
        ipcRenderer.send(this.props.ipcSendEventName, changed);
    }

    private renderTagOptions() {
        let tagOps = [];
        let ignoredTags = ["root", "temp", "documents", "other", "music"];

        if(this.state.tagOptions != null) {
            for(let i = 0; i < this.state.tagOptions.length; i++) {
                let tagName: string = this.state.tagOptions[i];
                if(isNaN(Number(tagName)) && isNaN(Number(tagName.substring(0, tagName.length - 1))) && !ignoredTags.includes(tagName)){
                    tagOps.push(<Option value={tagName} key={"tagopt" + i}>{tagName}</Option>);
                }
            }
        }

        return tagOps;
    }

    public render() {
        return (
            <Form.Item label={"Tags"} name={"file_tags"}>
                <Select mode="tags" style={{ width: '100%' }} onChange={this.sendTagChange} onSearch={this.searchTags}>
                    { this.renderTagOptions() }
                </Select>
            </Form.Item>
        );
    }
}