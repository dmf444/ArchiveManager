import * as React from "react";
import {Col, DatePicker, Form, Input, Row, Select} from "antd";
import {FileModel} from "@main/file/FileModel";
import {ipcRenderer} from "electron";
import {FileState} from "@main/file/FileState";
let moment = require("moment");
if ("default" in moment) {
    moment = moment["default"];
}


const { TextArea } = Input;
const { Option } = Select;
const log = require('electron-log');

interface FileInfoMetadataFormProps {
    editingCard: FileModel
}
interface FileInfoMetadataFormState {
    options: any[]
}

export class FileInfoMetadataForm extends React.Component<FileInfoMetadataFormProps, FileInfoMetadataFormState> {

    constructor(props) {
        super(props);
        this.state = {
            options: [<Option value={0}>Digital File</Option>]
        };

        this.updateDownloaderOptions = this.updateDownloaderOptions.bind(this);
        //ipcRenderer.on('get_downloaders_reply', this.updateDownloaderOptions);
    }

    componentDidMount(): void {
        ipcRenderer.send('file_edit_start', this.props.editingCard.id);

        if(this.props.editingCard.state == FileState.ACCEPTED) {
            ipcRenderer.send('file_edit_notnew', []);
        }
    }

    componentWillUnmount(): void {
        ipcRenderer.send('file_edit_stop', []);
        //ipcRenderer.removeListener('get_downloaders_reply', this.updateDownloaderOptions);
        log.info("dismantled!");
    }

    updateDownloaderOptions(event, args: string[]){
        let updatedDownloaders = [];
        args.forEach((downloadName: string) => {
            updatedDownloaders.push(<Option value={downloadName} key={"dl_" + downloadName.split(" ")[0]}>{downloadName}</Option>);
        });
        this.setState({options: updatedDownloaders});
    }

    getDateMoment = () => {
        return moment(this.props.editingCard.fileMetadata.date, "YYYY");
    };

    private nameTimer = null;
    fileNameChange = (e) => {
        clearTimeout(this.nameTimer);
        this.nameTimer = setTimeout(this.sendNameChange, 750, e.target.value);
    };

    sendNameChange = (value) => {
        ipcRenderer.send('file_edit_name', value);
    };

    private pageTimer = null;
    pageChange = (e) => {
        clearTimeout(this.pageTimer);
        this.pageTimer = setTimeout(this.sendPageChange, 750, e.target.value);
    };

    sendPageChange = (value) => {
        ipcRenderer.send('file_edit_page_count', value);
    };

    sendAccessChange = (changed, all) => {
        ipcRenderer.send('file_edit_restriction', changed);
    };

    sendDateChange = (date, dateString: string) => {
        ipcRenderer.send('file_edit_date', dateString);
    };

    sendContainerChange = (changed, all) => {
        ipcRenderer.send('file_edit_container', changed);
    }

    render() {
        return (
            <Form layout={"vertical"}>
                <Row gutter={[40, 16]}>
                    <Col span={8}>
                        <Form.Item label={"File Name"}>
                            <Input placeholder={this.props.editingCard.fileName} defaultValue={this.props.editingCard.fileMetadata.localizedName} onChange={this.fileNameChange}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={"Page Count"} name={"page_count"}>
                            <Input type={'number'} defaultValue={this.props.editingCard.fileMetadata.pageCount} onChange={this.pageChange}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={"Access Restriction"}>
                            <Select defaultValue={this.props.editingCard.fileMetadata.restrictions} onChange={this.sendAccessChange}>
                                <Option value={0} key={"ar0"}>Everyone</Option>
                                <Option value={1} key={"ar1"}>Logged In</Option>
                                <Option value={2} key={"ar2"}>Music Library</Option>
                                <Option value={3} key={"ar3"}>Staff</Option>
                                <Option value={4} key={"ar4"}>Special Access</Option>
                                <Option value={5} key={"ar5"}>Administrator</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[40, 16]}>
                    <Col span={8}>
                        <Form.Item label={"File Year"} name={"year"}>
                            <DatePicker picker="year" style={{width: "100%"}} onChange={this.sendDateChange} defaultValue={this.getDateMoment()}/>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label={"Container"} name={"container"}>
                            <Select defaultValue={0} onChange={this.sendContainerChange} style={{ width: '100%' }}>
                                {this.state.options}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label={"Description Version"} name={"desc_vers"}>
                            <Input/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item label={"Tags"}>
                            <Select mode="tags" style={{ width: '100%' }}>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[40, 16]}>
                    <Col span={24}>
                        <Form.Item name={"description"}>
                            <TextArea rows={6} placeholder="Description" defaultValue={this.props.editingCard.fileMetadata.description}/>
                        </Form.Item>

                    </Col>
                </Row>
            </Form>
        );
    }

}