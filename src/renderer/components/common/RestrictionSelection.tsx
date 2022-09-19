import React from "react";
import {Form, Select} from "antd";
import {ipcRenderer} from "electron";
const { Option } = Select;

export class RestrictionSelection extends React.Component<{ ipcSendEventName: string }, any> {

    public static defaultProps = {
        ipcSendEventName: 'file_edit_restriction'
    }

    sendAccessChange = (changed, all) => {
        ipcRenderer.send(this.props.ipcSendEventName, changed);
    };

    public render() {
        return (
            <Form.Item label={"Access Restriction"} name={"restriction"}>
                <Select onChange={this.sendAccessChange}>
                    <Option value={0} key={"ar0"}>Everyone</Option>
                    <Option value={1} key={"ar1"}>Logged In</Option>
                    <Option value={2} key={"ar2"}>Music Library</Option>
                    <Option value={3} key={"ar3"}>Staff</Option>
                    <Option value={4} key={"ar4"}>Special Access</Option>
                    <Option value={5} key={"ar5"}>Administrator</Option>
                </Select>
            </Form.Item>
        );
    }
}