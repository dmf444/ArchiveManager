import React from "react";
import {Button, Col, DatePicker, Divider, Empty, Form, Input, Popconfirm, Row, Typography} from "antd";
import {CloudUploadOutlined, DeleteOutlined, LeftOutlined} from "@ant-design/icons";
import {ipcRenderer} from "electron";
import {ContainerSelection} from "@/renderer/components/common/ContainerSelection";
import {RestrictionSelection} from "@/renderer/components/common/RestrictionSelection";
import {TagSelection} from "@/renderer/components/common/TagSelection";
import {FileColumns} from "@/renderer/components/common/FileColumns";
import {GroupModel} from "@main/group/models/GroupModel";
const { TextArea } = Input;


export class GroupEditor extends React.Component<{ insHeader: any, groupModel: GroupModel }, {}> {

    constructor(props) {
        super(props);
        this.props.insHeader(
            <Row>
                <Col span={12}>
                    <Button /*onClick={this.props.infoClose}*/><LeftOutlined />Save & Return</Button>
                </Col>
                <Col span={3} offset={5}>
                    <Popconfirm title={"Are you sure you want to upload the file?"} placement={"bottom"} /*onConfirm={() => {ipcRenderer.send('file_upload', this.props.editingCard.id); this.props.uploadSwitch()}}*/>
                        <Button type="primary" icon={<CloudUploadOutlined />} block={true} disabled={true}>Upload</Button>
                    </Popconfirm>
                </Col>
                <Col span={3} offset={1}>
                    <Popconfirm placement="bottomRight" title={"Are you sure you want to delete this file?"} /*onConfirm={this.deleteFile}*/ okText="Yes" cancelText="No">
                        <Button type={"primary"} danger={true}><DeleteOutlined />Delete File</Button>
                    </Popconfirm>
                </Col>
            </Row>
        );
    }

    private getFiles() {
        if (this.props.groupModel == null) return [];
        return this.props.groupModel.getFiles();
    }


    private textTimer = null;
    private onInputChange(e) {
        //log.info(name, e.target.value);
        clearTimeout(this.textTimer);
        this.textTimer = setTimeout(this.updateText.bind(this), 750, e.target.value);
    }

    private updateText(text: string) {
        ipcRenderer.send('group_edit_description', text);
    }

    public render() {
        return (
            <div>
                <Row>
                    <Col span={12} style={{display:"flex", justifyContent: "start"}}>
                        <Typography.Title style={{ marginBottom: 0 }}>Group #{this.props.groupModel.id}</Typography.Title>
                    </Col>
                    <Col span={12} style={{display:"flex", justifyContent: "flex-end", alignItems: 'center'}}>
                        <Button>Open Folder</Button>
                    </Col>
                </Row>
                <Form layout={"vertical"}>
                    <Divider orientation={ "left" }>Group Info</Divider>
                    <Row gutter={[40, 16]}>
                        <Col span={8}>
                            <Form.Item label={"File Name"} name={"file_name"}>
                                <Input placeholder={"file_name.info"} /* onChange={this.fileNameChange} *//>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation={"left"}>Default Shared Data</Divider>
                    <Row gutter={[40, 16]}>
                        <Col span={8}>
                            <Form.Item label={"File Year"} name={"year"}>
                                <DatePicker picker="year" style={{width: "100%"}} /* onChange={this.sendDateChange} */ />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <ContainerSelection ipcSendEventName={ "group_edit_container" }/>
                        </Col>
                        <Col span={8}>
                            <RestrictionSelection ipcSendEventName={"group_edit_restriction"}/>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24}>
                            <TagSelection ipcSendEventName={"group_edit_tags"}/>
                        </Col>
                    </Row>

                    <Row style={{width: "100%"}}>
                        <Col span={24}>
                            <Form.Item label={"Description"} name={"description"}>
                                <TextArea rows={4} onChange={event => this.onInputChange(event)}/>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>

                <Divider orientation={"left"}>Files</Divider>
                { this.getFiles().length > 0 && <FileColumns fileCardList={this.getFiles()} deleteFileHandler={() => {}} openEditorCallback={() => {}} setActiveCardCallback={() => {}}/> }
                { this.getFiles().length == 0 && <Empty description={"No files are attached to this group."}/> }
            </div>
        );
    }
}