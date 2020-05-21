import * as React from 'react';
import {Card, Col, Row} from 'antd';
import {
    DeleteOutlined,
    DownloadOutlined,
    EditTwoTone,
    FileImageOutlined,
    FileOutlined,
    FilePdfOutlined,
    FileTextOutlined,
    FileWordOutlined
} from '@ant-design/icons/lib';
import {FileModel} from "@main/file/FileModel";
import {FileState} from "@main/file/FileState";
const log = require('electron-log');

interface FileProps {
    infoOpen: (event: React.MouseEvent) => void,
    cardInfo: FileModel
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
        } else if(fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif")) {
            return <FileImageOutlined style={{fontSize: "3em"}}/>
        } else if(fileName.endsWith(".doc") || fileName.endsWith(".docx")){
            return <FileWordOutlined style={{fontSize: "3em"}}/>;
        } else {
            return <FileOutlined style={{fontSize: "3em"}}/>
        }
    }

    getActionButton = () => {
        let cardinal: any = FileState[this.props.cardInfo.state];
        if(cardinal === FileState.DUPLICATE.valueOf()) {
            return <DeleteOutlined onClick={this.deleteFile} style={{fontSize: "2em"}}/>;
        } else if((cardinal == FileState.NEW.valueOf() || cardinal == FileState.ACCEPTED.valueOf()) && this.props.cardInfo.url != ""){
            return <DownloadOutlined style={{fontSize: "2em"}} onClick={this.downloadFile}/>;
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
            return {width: "100%", borderColor: "yellow"};
        } else {
            return {width: "100%"};
        }
    }

    deleteFile = (event: React.MouseEvent) => {
        event.stopPropagation();
    }

    downloadFile = (event: React.MouseEvent) => {
        log.info("File downloaded!");
        event.stopPropagation();
    }

    render() {
        return (
            <div>
                <Card style={this.getCardStyle()} onClick={this.props.infoOpen}>
                    <Row justify={"space-between"} align={"middle"}>
                        <Col>
                            <Row style={{marginLeft: "-15px"}}>
                                <Col style={{paddingRight: "3px"}}>
                                    {this.getIcon(this.props.cardInfo.fileName)}
                                </Col>
                                <Col>
                                    <h4 style={{marginBottom: "0px"}}>{this.props.cardInfo.fileName}</h4>
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