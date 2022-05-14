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

    state = {
        importFolderType: null
    }

    finish = values => {
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
        } else if(values['directory_select'] != null && values['directory_select'].fileList.length == 1) {
            let file: UploadFile = values['multi_file'].fileList[0];
            if ('path' in file.originFileObj) {
                log.error(file.originFileObj.path);
            }
        }
        this.formRef.current.resetFields();
    };

    onDirChange = (s) => {
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
            onOk() {
                console.log('OK');
            },
            onCancel() {
                console.log('Cancel');
            }
        });
    };

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
