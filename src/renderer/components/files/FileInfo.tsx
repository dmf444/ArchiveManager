import * as React from 'react';
import {Card, Col, Row, Button, Divider, Input, Typography, Form, Select, Popconfirm, Upload, Empty} from 'antd';
import {ImageRendering} from "@/renderer/components/files/ImageRendering";

const { Option } = Select;
const log = require('electron-log');
const { Text, Title } = Typography;
const { TextArea } = Input;
import {
    DeleteOutlined,
    DeliveredProcedureOutlined, DownloadOutlined,
    IeOutlined,
    LeftOutlined,
    UploadOutlined,
    CloudUploadOutlined
} from '@ant-design/icons/lib';
import {FileModel} from "@main/file/FileModel";
import {ipcRenderer} from "electron";
import {FileInfoMetadataForm} from "@/renderer/components/files/FileInfoMetadataForm";
import {UploadFile} from "antd/lib/upload/interface";

interface FileProps {
    infoClose: (event: React.MouseEvent) => void
    insertHeaderFunc: any,
    editingCard: FileModel,
    uploadSwitch: () => void,
    grouped: boolean
}

interface FileInfoState {
    options: any[],
    imageData: string
}

export class FileInfo extends React.Component<FileProps, FileInfoState>{

    static defaultProps = {
        uploadSwitch: () => {},
        grouped: false
    }

    constructor(props) {
        super(props);
        let adds = [];
        if(!this.props.grouped) {
            adds.push(
                <Col span={3} offset={5}>
                    <Popconfirm title={"Are you sure you want to upload the file?"} placement={"bottom"} onConfirm={() => {ipcRenderer.send('file_upload', this.props.editingCard.id); this.props.uploadSwitch()}}>
                        <Button type="primary" icon={<CloudUploadOutlined />} block={true}>Upload</Button>
                    </Popconfirm>
                </Col>
            );
            adds.push(
                <Col span={3} offset={1}>
                    <Popconfirm placement="bottomRight" title={"Are you sure you want to delete this file?"} onConfirm={this.deleteFile} okText="Yes" cancelText="No">
                        <Button type={"primary"} danger={true}><DeleteOutlined />Delete File</Button>
                    </Popconfirm>
                </Col>
            );
        }
        let base = (
            <Row>
                <Col span={12}>
                    <Button onClick={this.props.infoClose}><LeftOutlined />Save & Return</Button>
                </Col>
                { adds }
            </Row>
        );
        this.props.insertHeaderFunc(base);
        this.state = {
            options: [<Option value={"Default Downloader"} key={"dd_001"}>Default Downloader</Option>],
            imageData: null
        };

        this.updateDownloaderOptions = this.updateDownloaderOptions.bind(this);
        ipcRenderer.on('get_downloaders_reply', this.updateDownloaderOptions);
        this.renderImagePreview = this.renderImagePreview.bind(this);
        ipcRenderer.on('chooseFile', this.renderImagePreview);
    }


    componentDidMount(): void {
        ipcRenderer.send('get_downloaders', []);
        ipcRenderer.send('chooseFile', this.props.editingCard.savedLocation);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('get_downloaders_reply', this.updateDownloaderOptions);
        ipcRenderer.removeListener('chooseFile', this.renderImagePreview);
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

    attachExtraFile = (thing) => {
        if(thing.file.status == "removed") {
            ipcRenderer.send('file_edit_eFRemove', '');
        } else {
            ipcRenderer.send('file_edit_extraFile', thing.file.originFileObj.path);
        }
    };

    private getDefaultFile(): UploadFile[] {
        if(this.props.editingCard.fileMetadata.extraFile != null && this.props.editingCard.fileMetadata.extraFile != "") {
            let index = this.props.editingCard.fileMetadata.extraFile.lastIndexOf("\\");
            let fileName = this.props.editingCard.fileMetadata.extraFile.slice(index + 1);
            return [
                {
                    uid: '1',
                    name: fileName,
                    status: 'done',
                    size: 0,
                    type: "tjomg"
                }
            ]
        }
        return null;
    }

    renderImagePreview(event, base64) {
        let clip: number = this.props.editingCard.savedLocation.lastIndexOf(".");
        let filetype = this.props.editingCard.savedLocation.substring(clip + 1);
        if(["jpg", "jpeg", "png", "gif", "webp"].includes(filetype.toLowerCase())){
            let middleman = filetype;
            if(filetype == "jpg" || filetype == "tiff" || filetype == "tif" || filetype == "webp"){
                middleman = "jpeg";
            }
            let fullData: string = "data:image/"+middleman+";base64," + base64;
            this.setState({imageData: fullData});
        }
    }

    private getImagePreview() {
        if(this.state.imageData != null) {
            return (
                <div style={{height: "100%", width: "100%", position: "absolute", display: "flex", justifyContent: 'center', alignItems: "center", backgroundColor: "#333333", borderRadius: "9px"}}>
                    <img src={this.state.imageData} alt={'preview'} style={{ maxHeight: "100%", maxWidth: "100%", position: "absolute", objectFit: "contain"}}/>
                </div>
            );
        } else {
            return (
                <div style={{height: "100%", width: "100%", position: "absolute", display: "flex", justifyContent: 'center', alignItems: "center", backgroundColor: "#333333", borderRadius: "9px"}}>
                    <Empty description={false} />
                </div>
            );
        }
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
                        <Card style={{height: "275px"}} cover={this.getImagePreview()}>
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

                        {!this.props.grouped && this.props.editingCard.url != '' &&
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
                        }
                        {!this.props.grouped &&
                            <Row gutter={[0, 16]}>
                                <Col span={12} style={{textAlign: "left"}}>
                                    <Upload multiple={false} onChange={this.attachExtraFile}
                                            defaultFileList={this.getDefaultFile()}>
                                        <Button><UploadOutlined/>Attach Secondary File</Button>
                                    </Upload>
                                </Col>
                            </Row>
                        }
                    </Col>
                </Row>

                <Divider orientation="left" style={{fontSize: "20px"}}>File Info</Divider>
                <FileInfoMetadataForm editingCard={this.props.editingCard} grouped={this.props.grouped}/>
            </div>
        );
    }
}
