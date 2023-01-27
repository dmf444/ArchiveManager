import * as React from 'react';

import '@public/style.css';
import {Button, Input, Upload, message, Row, Col, Form, Divider, Modal} from 'antd';
import {ExclamationCircleOutlined, FileOutlined, UploadOutlined} from '@ant-design/icons';
import 'antd/dist/antd.css';
import {ipcRenderer} from 'electron';
import {FormInstance} from 'antd/lib/form';
import {UploadFile} from 'antd/es/upload/interface';

const {Dragger} = Upload;
const { confirm } = Modal;
const log = require('electron-log');

export class AddFiles extends React.Component {
    formRef = React.createRef<FormInstance>();
    dirInput = React.createRef<HTMLInputElement>();

    state = {
        importFolderType: null,
        folderMsg: ""
    }

    finish = values => {
        let dirSelect = document.getElementById('path-picker') as HTMLInputElement;
        if (values['url'] != null && values['url'] != '') {
            ipcRenderer.send('homepage_url_add', values['url']);
        } else if (values['multi_file'] != null && values['multi_file'].fileList.length > 0) {
            let filePaths = [];
            for (let i = 0; i < values["multi_file"].fileList.length; i++) {
                let file: UploadFile = values['multi_file'].fileList[i];
                if ('path' in file.originFileObj) {
                    filePaths.push({fileName: file.originFileObj.name, path: file.originFileObj.path});
                }
            }
            ipcRenderer.send('import_local_file', filePaths);
        } else if(values['directory_select'] != null && dirSelect.files.length > 1) {
            let dirPath = "";
            let files = [];
            for(let i = 0; i < dirSelect.files.length; i++) {
                let file: any = dirSelect.files[i] as File;
                let fileRelPath = file.webkitRelativePath.split('/');

                if(dirPath === "") {
                    dirPath = file.path.substring(0, (file.path.indexOf(fileRelPath[0]) + fileRelPath[0].length + 1));
                }

                fileRelPath[0] = "./"
                files.push({
                    fileName: file.name,
                    filePath: file.path,
                    relativePath: fileRelPath.join('/')
                });

            }
            ipcRenderer.send('import_directory', {type: this.state.importFolderType, path: dirPath, files: files});
        }
        this.setState({ importFolderType: null, folderMsg: ""});
        this.formRef.current.resetFields();
    };

    onDirChange = (s) => {
        const fileList = s.target.files;
        if(fileList.length > 0) {
            this.setState({folderMsg: fileList.length});
            confirm({
                title: 'Upload as a group?',
                icon: <ExclamationCircleOutlined />,
                content: 'Uploading a folder can be done in one of two ways - grouped or ungrouped. If you group the files, they will be uploaded and handled differently in this program and the' +
                    'archives. Grouped files are stored together, and only appear as one global file. Ungrouped files will be split apart and treated as individual files. A good rule of thumb: if' +
                    'the folder contains related file (ie. \'tour 2018\' photos), they should be grouped. Otherwise, they should not be grouped.',
                okText: 'Group Creation',
                okType: 'danger',
                cancelText: 'Individual Uploads',
                closable: false,
                onOk: () => {
                    this.setModalState("grouped");
                },
                onCancel: () => {
                    this.setModalState("individual");
                }
            });
        }
    };

    setModalState = (newState: string | null) => {
        this.setState({ importFolderType: newState })
    }

    renderDirectorySearch = () => {
        // @ts-ignore
        return <input id="path-picker" type="file" webkitdirectory="true" onChange={this.onDirChange} style={{display: "none"}} ref={this.dirInput}/>
    }

    renderItemCount = () => {
        return <p style={{marginTop: "2px", marginBottom: 0}}>{this.state.folderMsg} item(s) selected in directory.</p>;
    }

    render() {
        return (
            <div className="addFilesComp">

                <Row justify="start">
                    <Col>
                        <Row>
                            <Col>
                                <Divider orientation="left" style={{fontSize: '20px'}}>
                                    Add Files
                                </Divider>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Form name={'add_files'} layout={'vertical'} onFinish={this.finish} ref={this.formRef}>
                    <Row gutter={12}>
                        <Col flex={12}>
                            <Form.Item name={'multi_file'}>
                                <Dragger multiple={true} directory={false}>
                                    <p className="ant-upload-drag-icon">
                                        <FileOutlined/>
                                    </p>
                                    <p className="ant-upload-text">
                                        Add one or more Files
                                    </p>
                                </Dragger>
                            </Form.Item>
                        </Col>

                        <Col flex={12}>
                            <Form.Item label="Add File By URL" name="url">
                                <Input/>
                            </Form.Item>
                            <Row>
                                <Col>
                                    <Form.Item name={'directory_select'}>
                                        <Row gutter={[8, 8]}>
                                            <Col>
                                                { this.renderDirectorySearch() }
                                                <Button icon={<UploadOutlined />} onClick={() => {this.dirInput.current.click()}}>Upload Folder</Button>
                                            </Col>
                                            <Col>
                                                {this.state.folderMsg != "" && this.renderItemCount() }
                                            </Col>
                                        </Row>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={7} offset={7}>
                            <Form.Item>
                                <Button size="large" type="primary" htmlType="submit" block={true}>
                                    Submit
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}
