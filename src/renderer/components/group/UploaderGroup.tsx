import * as React from 'react';
import {Button, Progress, Result, Spin, Tooltip} from "antd";
import {ipcRenderer} from "electron";

type UploaderProps = {
    headerControl: (any) => void,
    groupId: number,
    resetFiles: (event: React.MouseEvent) => void
}
export class UploaderGroup extends React.Component<UploaderProps, any> {

    state = {
        status: "uploading",
        total: 0,
        current: {errors: 0, success: 0, skips: 0},
        completion: null
    }

    constructor(props) {
        super(props);
        this.props.headerControl(null);

        this.updateStatus = this.updateStatus.bind(this);
        ipcRenderer.on('status_update', this.updateStatus);
        this.updateTotal = this.updateTotal.bind(this);
        ipcRenderer.on('group_upload_start', this.updateTotal);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('status_update', this.updateStatus);
        ipcRenderer.removeListener('group_upload_start', this.updateTotal);
    }

    updateTotal = (event, args) => {
        this.setState({total: args});
    }

    updateStatus = (event, args) => {
        let current = this.state.current;
        if(args == 0) {
            current.errors += 1;
        } else if(args == 1) {
            current.success += 1;
        } else if(args == -1){
            this.setState({status: "completed", completion: false});
            return;
        } else {
            current.skips += 1;
        }

        if(this.computePercentage(current) == 100) {
            this.setState({status: "completed", completion: args, current: current});
        } else {
            this.setState({current: current});
        }
    }

    computePercentage = (current) => {
        return ((current.skips + current.errors + current.success) / this.state.total) * 100;
    }

    getPercentage = () => {
        return Math.round(this.computePercentage(this.state.current));
    }

    getSuccessPercentage = () => {
        return ((this.state.current.success) / this.state.total) * 100;
    }

    getRenderByState = () => {
        if(this.state.status === "uploading") {
            return (
                <div>
                    <Result
                        title="Uploading Record to database"
                        icon={
                            <Spin tip={"Uploading..."}/>
                        }
                        extra={[
                            <Tooltip title={`${this.state.current.success} Uploaded / ${this.state.current.errors} Failed / ${this.state.current.skips} Skipped`}>
                                <Progress percent={this.getPercentage()} success={{ percent: this.getSuccessPercentage() }} />
                            </Tooltip>
                        ]}
                    />
                </div>
            )
        } else if (this.state.status === "completed") {
            if(this.state.completion) {
                return (
                    <Result
                        status="success"
                        title="Successfully Uploaded Group to Database!"
                        subTitle={"Uploaded Group: " + this.props.groupId + "."}
                        extra={[
                            <Button onClick={(event) => { this.props.resetFiles(event) }}>Return to Files</Button>
                        ]}
                    />
                );
            } else {
                return (
                    <Result
                        status="error"
                        title="Submission Failed"
                        subTitle={"Please check the logs before resubmitting."}
                        extra={[
                            <Button onClick={(event) => { this.props.resetFiles(event) }}>Return to Files</Button>
                        ]}
                    />
                );
            }
        }
    }

    public render(): React.ReactNode {
        return this.getRenderByState();
    }

}