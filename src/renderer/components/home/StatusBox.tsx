import * as React from 'react';
import {Card} from "antd";
import {ipcRenderer} from "electron";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons/lib";
const log = require('electron-log');

type StatusProps = {
    replyCall: string,
    getCall: string,
    title: string
}

export class StatusBox extends React.Component<StatusProps> {

    state = {
        loading: true,
        connected: false
    };

    constructor(props) {
        super(props);
        this.updateStatus = this.updateStatus.bind(this);
        ipcRenderer.on(this.props.replyCall, this.updateStatus);

    }

    componentDidMount(): void {
        ipcRenderer.send(this.props.getCall, []);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener(this.props.replyCall, this.updateStatus);
    }

    updateStatus(event, args){
        var connect = false;
        if(args) {
            connect = true;
        }
        this.setState({loading: false, connected: connect});
    }

    getStatusIcon = () => {
        if(this.state.connected) {
            return <CheckCircleTwoTone twoToneColor="#52c41a" style={{fontSize: "3em"}}/>
        } else {
            return <CloseCircleTwoTone twoToneColor="#cc0000" style={{fontSize: "3em"}}/>
        }
    }

    getStatusMessage = () => {
        if(this.state.connected) {
            return "Connected!"
        } else {
            return "Disconnected!"
        }
    }


    render(): React.ReactNode {
        return (
            <Card size="small" title={this.props.title} loading={this.state.loading}>
                {this.getStatusIcon()}
                <p style={{marginBottom: 0, marginTop: "14px"}}>{this.getStatusMessage()}</p>
            </Card>
        );
    }

}