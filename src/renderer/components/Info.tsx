import * as React from "react";
import {Button, Descriptions, Empty, PageHeader, Row, Space, Table, Tabs, Tag} from 'antd';
import {CheckCircleOutlined, CheckCircleTwoTone, CloseCircleTwoTone, CloudSyncOutlined} from "@ant-design/icons/lib";
import {ipcRenderer} from "electron";
import {DownloadTable} from '@/renderer/components/info/DownloadTable';
import {FolderOpenOutlined} from "@ant-design/icons";
const log = require('electron-log');
const { TabPane } = Tabs;


export class Info extends React.Component {

    state = {
        currentVersion: '1.0.0',
        newestVersion: '1.0.0',
        lastUpdated: 'January 8, 2010 - 05:45 AM',
        uploadedFiles: []
    }

    constructor(props) {
        super(props);

        this.updateVersionInfo = this.updateVersionInfo.bind(this);
        ipcRenderer.on('info_update_status_reply', this.updateVersionInfo);
        this.parseData = this.parseData.bind(this);
        ipcRenderer.on('upload_list_reply', this.parseData);
    }

    componentDidMount(): void {
        ipcRenderer.send('info_update_status', '');
        ipcRenderer.send('upload_list_get', '');
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('info_update_status_reply', this.updateVersionInfo);
        ipcRenderer.removeListener('upload_list_reply', this.parseData);
    }

    updateClicked = () => {
        ipcRenderer.send('info_update_request', '');
    }

    folderClicked = () => {
        ipcRenderer.send('open_config_folder', '');
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

    private columns = [
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: text => {
                return text === "success" ? <CheckCircleTwoTone twoToneColor="#52c41a" /> : <CloseCircleTwoTone twoToneColor="#eb2f96"/>;
            }
        },
        {
            title: 'Internal Id',
            dataIndex: 'intid',
            key: 'intid'
        },
        {
            title: 'File Name',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: 'Date/Time',
            dataIndex: 'datetime',
            key: 'datetime'
        },
        {
            title: 'Errors',
            dataIndex: 'errors',
            key: 'errors',
            ellipsis: true,
            render: text => {
                return text instanceof Array ? text.join(", ") : text;
            }
        }
    ];

    parseData = (event, args: any) => {
        let newData = [];
        for(let i = 0; i < args.length; i++) {
            let uploadItem = args[args.length - 1 - i];
            uploadItem['key'] = i;
            newData.push(uploadItem);
        }
        this.setState({uploadedFiles: newData});
    }

    render() {
        return(
            <div className="infoComp">
                <PageHeader
                    backIcon={false}
                    title="Information"
                    extra={[
                        <Space>
                            <Button key="1" type="primary" onClick={this.updateClicked}><CloudSyncOutlined />Check For Updates</Button>
                            <Button key={'2'} type={"default"} onClick={this.folderClicked}><FolderOpenOutlined/>Open Config Folder</Button>
                        </Space>
                    ]}
                >
                    <div className="content">
                        <div className="main" style={{width: "75%"}}>{this.renderContent()}</div>
                    </div>
                </PageHeader>
                <Tabs>
                    <TabPane tab={"Archive Policies"} key={"1"} style={{textAlign: "left"}}>
                        <Empty/>
                    </TabPane>
                    <TabPane tab={"Upload History"} key={"2"} style={{textAlign: "left"}}>
                        <Table columns={this.columns} dataSource={this.state.uploadedFiles} />
                    </TabPane>
                    <TabPane tab={"Downloads"} key={"3"} style={{textAlign: "left"}}>
                        <DownloadTable/>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}