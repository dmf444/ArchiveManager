import * as React from 'react';
import {Card, Col, Row, Button, Divider, Input, Typography, Form, Select, DatePicker, Popconfirm} from 'antd';

const { Option } = Select;
const log = require('electron-log');
const { Text, Title } = Typography;
const { TextArea } = Input;
import {
    DeleteOutlined,
    DeliveredProcedureOutlined, DownloadOutlined,
    EditTwoTone,
    FileOutlined,
    IeOutlined,
    LeftOutlined,
    SettingOutlined
} from '@ant-design/icons/lib';
import {FileModel} from "@main/file/FileModel";
import {ipcRenderer} from "electron";
import {FileInfoMetadataForm} from "@/renderer/components/files/FileInfoMetadataForm";

interface FileProps {
    infoClose: (event: React.MouseEvent) => void
    insertHeaderFunc: any,
    editingCard: FileModel
}

interface FileInfoState {
    options: any[]
}

export class FileInfo extends React.Component<FileProps, FileInfoState>{

    constructor(props) {
        super(props);
        this.props.insertHeaderFunc(
            <Row>
                <Col span={12}>
                    <Button onClick={this.props.infoClose}><LeftOutlined />Go Back</Button>
                </Col>
                <Col span={1} offset={9}>
                    <Popconfirm placement="bottomRight" title={"Are you sure you want to delete this file?"} onConfirm={this.deleteFile} okText="Yes" cancelText="No">
                        <Button type={"primary"} danger={true}><DeleteOutlined />Delete File</Button>
                    </Popconfirm>
                </Col>
            </Row>
        );
        this.state = {
            options: [<Option value={"Default Downloader"}>Default Downloader</Option>]
        };

        this.updateDownloaderOptions = this.updateDownloaderOptions.bind(this);
        ipcRenderer.on('get_downloaders_reply', this.updateDownloaderOptions);
    }


    componentDidMount(): void {
        ipcRenderer.send('get_downloaders', []);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('get_downloaders_reply', this.updateDownloaderOptions);
    }

    updateDownloaderOptions(event, args: string[]){
        let updatedDownloaders = [];
        args.forEach((downloadName: string) => {
            updatedDownloaders.push(<Option value={downloadName} key={"dl_" + downloadName.split(" ")[0]}>{downloadName}</Option>);
        });
        this.setState({options: updatedDownloaders});
    }

    redownloadForm = (values) => {
        ipcRenderer.send('file_redownload', [this.props.editingCard.id, values["downloader"]]);
    }



    deleteFile = (event: React.MouseEvent) => {
        ipcRenderer.send('file_delete', this.props.editingCard.id);
        this.props.infoClose(event);
    }

    sendOpenBrowser = (event) => {
        ipcRenderer.send('shell_open', this.props.editingCard.url);
    };

    sendFileBrowser = (event) => {
        ipcRenderer.send('shell_open_file', this.props.editingCard.savedLocation);
    };

    render() {
        return (
            <div className="fileInfo">
                {/*
                    File description
                */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Card style={{height: "275px"}}>
                            File Preview (snapshot of PDF or small img)
                        </Card>
                    </Col>

                    <Col span={16}>
                        <Row gutter={[40, 16]}>
                            <Col>
                                <h4 style={{textAlign: "left"}}>{this.props.editingCard.fileName}</h4>
                            </Col>
                        </Row>
                        <Row gutter={[40, 16]}>
                            <Col>
                                <Text style={{textAlign: "left"}}>{this.props.editingCard.md5}</Text>
                            </Col>
                        </Row>

                        <Row gutter={[0, 16]}>
                            <Col span={11}>
                                <Button type="primary" icon={<DeliveredProcedureOutlined />} block={true} style={{paddingLeft: "10px", paddingRight: "10px"}} onClick={this.sendFileBrowser}>Open File</Button>
                            </Col>
                            <Col span={11} offset={1}>
                                <Button type="primary" icon={<IeOutlined />} block={true} style={{paddingLeft: "10px", paddingRight: "10px"}} onClick={this.sendOpenBrowser}>Open File In Browser</Button>
                            </Col>
                        </Row>

                        <Row gutter={[0, 16]}>
                            <Form layout={"inline"} style={{width: "100%"}} initialValues={{ remember: true }} onFinish={this.redownloadForm}>
                                <Col span={12}>
                                    <Form.Item name={"downloader"}>
                                        <Select style={{borderTopRightRadius: 0, borderBottomRightRadius: 0}} placeholder="Select a downloader">
                                            {this.state.options}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12} flex={"initial"}>
                                    <Button type="primary" htmlType={"submit"} icon={<DownloadOutlined />} style={{paddingLeft: "10px", paddingRight: "10px", width: "125px", borderTopLeftRadius: 0, borderBottomLeftRadius: 0}}>Redownload</Button>
                                </Col>
                        </Form>
                        </Row>
                    </Col>
                </Row>

                <Divider orientation="left" style={{fontSize: "20px"}}>File Info</Divider>
                <FileInfoMetadataForm editingCard={this.props.editingCard}/>
            </div>
        );
    }
}