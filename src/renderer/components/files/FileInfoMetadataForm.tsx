import * as React from "react";
import {Col, DatePicker, Divider, Form, Input, Row, Select} from "antd";
import {FileModel} from "@main/file/FileModel";
import {ipcRenderer} from "electron";
import {FileState} from "@main/file/FileState";
import {FileDescriptionRender} from "@/renderer/components/files/FileDescriptionRender";
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
    options: any[],
    tagOptions: any[],
    descriptionVersions: any[],
    selectedVersion: string
}

export class FileInfoMetadataForm extends React.Component<FileInfoMetadataFormProps, FileInfoMetadataFormState> {

    constructor(props) {
        super(props);
        this.state = {
            options: [{id: 0, name: "Digital File"}],
            descriptionVersions: [],
            selectedVersion: this.props.editingCard.fileMetadata.descriptionVersion,
            tagOptions: []
        };

        this.setTagOptions = this.setTagOptions.bind(this);
        ipcRenderer.on('file_edit_get_tags_reply', this.setTagOptions);
        this.setContainerOptions = this.setContainerOptions.bind(this);
        ipcRenderer.on('file_edit_get_containers_reply', this.setContainerOptions);
        this.setDescriptionVersions = this.setDescriptionVersions.bind(this);
        ipcRenderer.on('file_edit_get_desc_version_reply', this.setDescriptionVersions);
    }

    componentDidMount(): void {
        ipcRenderer.send('file_edit_start', this.props.editingCard.id);
        ipcRenderer.send('file_edit_get_tags', null);
        ipcRenderer.send('file_edit_get_containers', null);
        ipcRenderer.send('file_edit_get_desc_version', null);

        if(this.props.editingCard.state == FileState.ACCEPTED) {
            ipcRenderer.send('file_edit_notnew', []);
        }
    }

    componentWillUnmount(): void {
        ipcRenderer.send('file_edit_save', []);
        ipcRenderer.removeListener('file_edit_get_tags_reply', this.setTagOptions);
        ipcRenderer.removeListener('file_edit_get_containers_reply', this.setContainerOptions);
        ipcRenderer.removeListener('file_edit_get_desc_version_reply', this.setDescriptionVersions);
    }

    setContainerOptions(event, args: any[]) {
        if(args != null) {
            this.setState({options: args});
        }
    }

    setTagOptions(event, args: string[]){
        this.setState({tagOptions: args});
    }

    setDescriptionVersions(event, args: any[]) {
        this.setState({descriptionVersions: args});
    }

    private tagGetTimer = null;
    searchTags = (value: string) => {
        clearTimeout(this.tagGetTimer);
        this.tagGetTimer = setTimeout(this.sendTagSearch, 300, value);
    }
    sendTagSearch = (value) => {
        ipcRenderer.send('file_edit_get_tags', value);
    };


    renderContainerOptions = () => {
      let options = [];
      this.state.options.forEach((optionList) => {
          options.push(<Option value={optionList.id} key={"containerselect_" + optionList.id}>{optionList.name}</Option>);
      });
      return options;
    };

    getDateMoment = () => {
        return this.props.editingCard.fileMetadata.date == "" ? null : moment(this.props.editingCard.fileMetadata.date, "YYYY");
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

    sendDescChange = (value) => {
        ipcRenderer.send('file_edit_description', value);
    };

    sendDescVersion = (changed, all) => {
        ipcRenderer.send('file_edit_desc_version', changed);
        this.setState({selectedVersion: changed});
    }

    sendTagChange = (changed, all) => {
        ipcRenderer.send('file_edit_tags', changed);
    }

    private renderTagOptions() {
        let tagOps = [];
        let ignoredTags = ["root", "temp", "documents", "other", "music"];

        if(this.state.tagOptions != null) {
            for(let i = 0; i < this.state.tagOptions.length; i++) {
                let tagName: string = this.state.tagOptions[i];
                if(isNaN(Number(tagName)) && isNaN(Number(tagName.substring(0, tagName.length - 1))) && !ignoredTags.includes(tagName)){
                    tagOps.push(<Option value={tagName} key={"tagopt" + i}>{tagName}</Option>);
                }
            }
        }

        return tagOps;
    }

    private renderDescriptionOptions() {
        let renderOptions = [];
        if(this.state.descriptionVersions.length > 0) {
            this.state.descriptionVersions.forEach(value => {
               renderOptions.push(<Option value={value.version}>{value.name}</Option>);
            });
        }
        return renderOptions;
    }



    private getDefaultValues() {
        let jsonObj = JSON.parse(this.props.editingCard.fileMetadata.description);
        let defaultValues = {
            file_name: this.props.editingCard.fileMetadata.localizedName,
            page_count:this.props.editingCard.fileMetadata.pageCount,
            restriction: this.props.editingCard.fileMetadata.restrictions,
            year: this.getDateMoment(),
            container_sel: this.props.editingCard.fileMetadata.container,
            desc_vers: this.props.editingCard.fileMetadata.descriptionVersion,
            file_tags: this.props.editingCard.fileMetadata.tags
        };
        if(jsonObj != null) {
            Object.keys(jsonObj).forEach(key => {
                defaultValues[key] = jsonObj[key];
            });
        }

        return defaultValues;
    }


    render() {
        return (
            <Form layout={"vertical"} initialValues={this.getDefaultValues()}>
                <Row gutter={[40, 16]}>
                    <Col span={8}>
                        <Form.Item label={"File Name"} name={"file_name"}>
                            <Input placeholder={this.props.editingCard.fileName} onChange={this.fileNameChange}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={"Page Count"} name={"page_count"}>
                            <Input type={'number'} onChange={this.pageChange}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={"Access Restriction"} name={"restriction"}>
                            <Select onChange={this.sendAccessChange}>
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
                            <DatePicker picker="year" style={{width: "100%"}} onChange={this.sendDateChange}/>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item label={"Container"} name={"container_sel"}>
                            <Select onChange={this.sendContainerChange}>
                                {this.renderContainerOptions()}
                            </Select>
                        </Form.Item>
                    </Col>

                    <Col span={8}>
                        <Form.Item label={"Description Version"} name={"desc_vers"}>
                            <Select onSelect={this.sendDescVersion}>
                                {this.renderDescriptionOptions()}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Form.Item label={"Tags"} name={"file_tags"}>
                            <Select mode="tags" style={{ width: '100%' }} onChange={this.sendTagChange} onSearch={this.searchTags}>
                                {this.renderTagOptions()}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row style={{width: "100%"}}>
                    <Divider orientation={"left"}>Description</Divider>
                    <FileDescriptionRender version={this.state.selectedVersion} data={this.props.editingCard.fileMetadata.description} onChange={this.sendDescChange}/>
                </Row>
            </Form>
        );
    }
}
