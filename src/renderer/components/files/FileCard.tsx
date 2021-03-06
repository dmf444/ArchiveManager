import * as React from 'react';
import {Card, Col, Row, Tooltip} from 'antd';
import {
    DeleteOutlined, DeleteTwoTone,
    DownloadOutlined,
    EditTwoTone,
    FileImageOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    FileWordOutlined, FileZipOutlined,
    LoadingOutlined
} from '@ant-design/icons/lib';
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
import {ipcRenderer} from "electron";

const log = require('electron-log');

interface FileProps {
    infoOpen: (event: React.MouseEvent) => void,
    filterFile: (file: FileModel) => void,
    cardInfo: FileModel,
    setCardEditing: (file: FileModel) => void
}

export class FileCard extends React.Component<FileProps, {}>{

    constructor(props) {
        super(props);
    }

    getIcon = (fileName: string) => {
        if(fileName.endsWith(".pdf")) {
            return <FilePdfOutlined style={{fontSize: "3em"}}/>;
        } else if(fileName.endsWith(".txt")) {
            return <FileTextOutlined style={{fontSize: "3em"}}/>
        } else if(fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") || fileName.endsWith(".tif") || fileName.endsWith(".tiff")) {
            return <FileImageOutlined style={{fontSize: "3em"}}/>
        } else if(fileName.endsWith(".doc") || fileName.endsWith(".docx")) {
            return <FileWordOutlined style={{fontSize: "3em"}}/>;
        } else if(fileName.endsWith(".zip") || fileName.endsWith(".rar")){
            return <FileZipOutlined style={{fontSize: "3em"}}/>
        } else {
            return <FileOutlined style={{fontSize: "3em"}}/>
        }
    }

    getActionButton = () => {
        let cardinal: any = FileState[this.props.cardInfo.state];
        if(cardinal === FileState.DUPLICATE.valueOf()) {
            return <DeleteTwoTone style={{fontSize: "2em"}} onClick={this.deleteFile}/>;
        } else if(cardinal == FileState.NEW.valueOf() && this.props.cardInfo.url != ""){
            return <DownloadOutlined style={{fontSize: "2em", color: "#1890ff"}} onClick={this.downloadFile}/>;
        } else {
            return <EditTwoTone style={{fontSize: "2em"}} onClick={this.props.infoOpen}/>;
        }
    }

    getCardStyle = () => {
        let cardinal: any = FileState[this.props.cardInfo.state];
        if(cardinal === FileState.DUPLICATE.valueOf()) {
            return {width: "100%", borderColor: "purple"};
        } else if(cardinal === FileState.ERROR.valueOf()) {
            return {width: "100%", borderColor: "red"};
        } else if(cardinal === FileState.WARN.valueOf()) {
            return {width: "100%", borderColor: "#fadb14"};
        } else {
            return {width: "100%"};
        }
    }

    deleteFile = (event: React.MouseEvent) => {
        event.stopPropagation();
        ipcRenderer.send('file_delete', this.props.cardInfo.id);
        this.props.filterFile(this.props.cardInfo);
    }

    downloadFile = (event: React.MouseEvent) => {
        event.stopPropagation();
        ipcRenderer.send('file_download', this.props.cardInfo.id);
        this.props.cardInfo.state = FileState.NORMAL;
        this.setState({})
    }

    clickHandler = (event) => {
        this.props.setCardEditing(this.props.cardInfo);
        this.props.infoOpen(event);
    }

    shortendName = () => {
        if(this.props.cardInfo.fileName.length >= 30) {
            let lastDot: number = this.props.cardInfo.fileName.lastIndexOf(".");
            return this.props.cardInfo.fileName.substring(0, 22) + "..." + this.props.cardInfo.fileName.slice(lastDot);
        }
        return this.props.cardInfo.fileName;
    }


    render() {
        return (
            <div>
                <Card style={this.getCardStyle()} onClick={this.clickHandler}>
                    <Row justify={"space-between"} align={"middle"}>
                        <Col>
                            <Row style={{marginLeft: "-15px"}}>
                                <Col style={{paddingRight: "3px"}}>
                                    {this.getIcon(this.props.cardInfo.fileName)}
                                </Col>
                                <Col>
                                    <Tooltip placement="topLeft" title={this.props.cardInfo.fileName}>
                                        <h4 style={{marginBottom: "0px"}}>{this.shortendName()}</h4>
                                    </Tooltip>
                                    <h6 style={{textAlign: "left"}}>File Id:  {this.props.cardInfo.id}</h6>
                                </Col>
                            </Row>
                        </Col>
                        <Col style={{marginRight: "-15px"}}>
                            {this.getActionButton()}
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }
}