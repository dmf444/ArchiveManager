import * as React from "react";
import {Button, Descriptions, PageHeader, Row, Tabs, Tag} from 'antd';
import {CloudSyncOutlined} from "@ant-design/icons/lib";
import {ipcRenderer} from "electron";
const log = require('electron-log');
const { TabPane } = Tabs;


export class Info extends React.Component {

    state = {
        currentVersion: '1.0.0',
        newestVersion: '1.0.0',
        lastUpdated: 'January 8, 2010 - 05:45 AM'
    }

    constructor(props) {
        super(props);

        this.updateVersionInfo = this.updateVersionInfo.bind(this);
        ipcRenderer.on('info_update_status_reply', this.updateVersionInfo);
    }

    componentDidMount(): void {
        ipcRenderer.send('info_update_status', '');
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('info_update_status_reply', this.updateVersionInfo);
    }

    updateClicked = () => {
        ipcRenderer.send('info_update_request', '');
    }

    updateVersionInfo = (event, args) => {
        if(args['remVersion'] == null){
            args['remVersion'] = "1.0.0";
        }
        let date = new Date(args['lastCheck']);
        let strDate = date.toLocaleString(undefined, {year: 'numeric', month: 'long', day: '2-digit', hour: '2-digit', minute: 'numeric'});
        this.setState({currentVersion: args.curVersion, newestVersion: args['remVersion'], lastUpdated: strDate});
    }

    renderContent = (column = 4) => (
        <Descriptions size="small" column={column}>
            <Descriptions.Item label="Current Version"><Tag color="blue">{this.state.currentVersion}</Tag></Descriptions.Item>
            <Descriptions.Item label="Newest Version"><Tag color="geekblue">{this.state.newestVersion}</Tag></Descriptions.Item>
            <Descriptions.Item label="Last Updated" span={2}>{this.state.lastUpdated}</Descriptions.Item>
        </Descriptions>
    );

    render() {
        return(
            <div className="infoComp">
                <PageHeader
                    backIcon={false}
                    title="Information"
                    extra={[
                        <Button key="1" type="primary" onClick={this.updateClicked}><CloudSyncOutlined />Check For Updates</Button>
                    ]}
                >
                    <div className="content">
                        <div className="main" style={{width: "75%"}}>{this.renderContent()}</div>
                    </div>
                </PageHeader>
                <Tabs>
                    <TabPane tab={"Archive Policies"} key={"1"} style={{textAlign: "left"}}>Hello!</TabPane>
                    <TabPane tab={"Upload History"} key={"2"} style={{textAlign: "left"}}>Hello 2!</TabPane>
                </Tabs>
            </div>
        );
    }
}