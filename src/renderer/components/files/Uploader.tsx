import * as React from 'react';
import {Button, Result, Spin} from "antd";
import {ipcRenderer} from "electron";

type UploaderProps = {
    headerControl: (any) => void,
    fileId: number,
    resetFiles: (event: React.MouseEvent) => void
}
export class Uploader extends React.Component<UploaderProps, any> {

    state = {
        status: "uploading",
        completion: null
    }

    constructor(props) {
        super(props);
        this.props.headerControl(null);

        this.updateStatus = this.updateStatus.bind(this);
        ipcRenderer.on('status_update', this.updateStatus);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('status_update', this.updateStatus);
    }

    updateStatus = (event, args) => {
        this.setState({status: "completed", completion: args});
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
                    />
                </div>
            )
        } else if (this.state.status === "completed") {
            if(this.state.completion) {
                return (
                    <Result
                        status="success"
                        title="Successfully Uploaded Record to Database!"
                        subTitle={"Uploaded File id: " + this.props.fileId + "."}
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