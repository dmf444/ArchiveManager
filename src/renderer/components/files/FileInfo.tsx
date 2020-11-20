import * as React from 'react';
import {Card, Col, Row, Button, Divider, Input, Typography, Form, Select, DatePicker, Popconfirm, Upload} from 'antd';
import {ImageRendering} from "@/renderer/components/files/ImageRendering";

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
    LeftOutlined, SaveOutlined,
    SettingOutlined, UploadOutlined
} from '@ant-design/icons/lib';
import {FileModel} from "@main/file/FileModel";
import {ipcRenderer} from "electron";
import {FileInfoMetadataForm} from "@/renderer/components/files/FileInfoMetadataForm";
import {UploadFile} from "antd/lib/upload/interface";

interface FileProps {
    infoClose: (event: React.MouseEvent) => void
    insertHeaderFunc: any,
    editingCard: FileModel
}

interface FileInfoState {
    options: any[],
    imageData: string
}

export class FileInfo extends React.Component<FileProps, FileInfoState>{

    constructor(props) {
        super(props);
        this.props.insertHeaderFunc(
            <Row>
                <Col span={12}>
                    <Button onClick={this.props.infoClose}><LeftOutlined />Go Back</Button>
                </Col>
                <Col span={3} offset={5}>
                    <Button type="primary" icon={<SaveOutlined/>} onClick={() => ipcRenderer.send('file_edit_save', [])} block={true}>Save</Button>
                </Col>
                <Col span={3} offset={1}>
                    <Popconfirm placement="bottomRight" title={"Are you sure you want to delete this file?"} onConfirm={this.deleteFile} okText="Yes" cancelText="No">
                        <Button type={"primary"} danger={true}><DeleteOutlined />Delete File</Button>
                    </Popconfirm>
                </Col>
            </Row>
        );
        this.state = {
            options: [<Option value={"Default Downloader"} key={"dd_001"}>Default Downloader</Option>],
            imageData: null
        };

        this.updateDownloaderOptions = this.updateDownloaderOptions.bind(this);
        ipcRenderer.on('get_downloaders_reply', this.updateDownloaderOptions);
    }


    componentDidMount(): void {
        ipcRenderer.send('get_downloaders', []);
        this.renderImagePreview();
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

    attachExtraFile = (thing) => {
        if(thing.file.status == "removed") {
            ipcRenderer.send('file_edit_eFRemove', '');
        } else {
            ipcRenderer.send('file_edit_extraFile', thing.file.originFileObj.path);
        }
    }

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

    private renderImagePreview() {
        let clip: number = this.props.editingCard.savedLocation.lastIndexOf(".");
        let filetype = this.props.editingCard.savedLocation.substring(clip + 1);
        log.info(filetype.toLowerCase());
        if(["jpg", "jpeg", "png", "gif", "tiff", "tif", "webp", "raw"].includes(filetype.toLowerCase())){
            try {
                ImageRendering.imageToBase64(this.props.editingCard.savedLocation).then(resp => {
                    let middleman = filetype;
                    if(filetype == "jpg" || filetype == "tiff" || filetype == "tif" || filetype == "webp"){
                        middleman == "jpeg";
                    }
                    let fullData: string = "data:image/"+middleman+";base64," + resp;
                    this.setState({imageData: fullData})
                }).catch(err => {
                    log.error(err);
                })
            } catch (e) {
                log.error("failed to load image.")
            }
        }
    }

    private getImagePreview() {
        if(this.state.imageData != null) {
            return (<img src={this.state.imageData} alt={'preview'}/>);
        } else {
            return null;
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
                        <Row>
                            <Col span={12} style={{textAlign: "left"}}>
                                <Upload multiple={false} onChange={this.attachExtraFile} defaultFileList={this.getDefaultFile()}>
                                    <Button><UploadOutlined />Attach Secondary File</Button>
                                </Upload>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Divider orientation="left" style={{fontSize: "20px"}}>File Info</Divider>
                <FileInfoMetadataForm editingCard={this.props.editingCard}/>
            </div>
        );
    }
}