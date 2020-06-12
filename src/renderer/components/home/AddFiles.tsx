
import * as React from 'react';

import '@public/style.css';
import { Button, Input, Upload, message, Row, Col, Form, Divider } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

import {DeleteTwoTone, UploadOutlined} from '@ant-design/icons/lib';
import 'antd/dist/antd.css';
import {ipcRenderer} from "electron";
import {FormInstance} from "antd/lib/form";
import {UploadFile} from "antd/es/upload/interface";
const log = require('electron-log');

export class AddFiles extends React.Component {
    formRef = React.createRef<FormInstance>();

    finish = values => {
      if(values['url'] != null && values['url'] != ""){
          ipcRenderer.send('homepage_url_add', values['url']);
      } else if(values["multi_file"] != null && values["multi_file"].fileList.length > 0){
          let filePaths = [];
          for(let i = 0; i < values["multi_file"].fileList.length; i++) {
              let file: UploadFile = values["multi_file"].fileList[i];
              if ("path" in file.originFileObj) {
                  filePaths.push({fileName: file.originFileObj.name, path: file.originFileObj.path});
              }
          }
          ipcRenderer.send('import_local_file', filePaths);
      }
        this.formRef.current.resetFields();
    };
    
    render() {
        return(
            <div className="addFilesComp">

                <Row justify="start">
                    <Col>
                        <Row>
                            <Col>
                                <Divider
                                    orientation="left"
                                    style={{
                                    fontSize: "20px"
                                }}>Add Files
                                </Divider>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Form name={"add_files"} layout={"vertical"} onFinish={this.finish} ref={this.formRef}>
                    <Row gutter={12}>
                        <Col flex={12}>
                            <Form.Item name={"multi_file"}>
                                <Dragger multiple={true}>
                                    <p className="ant-upload-drag-icon">
                                        <FileOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                        Add one or more Files
                                    </p>
                                </Dragger>
                            </Form.Item>
                        </Col>

                        <Col flex={12}>
                            <Form.Item label="Add File By URL" name="url">
                                <Input />
                            </Form.Item>
                            <Row>
                                <Col>
                                    <Form.Item name={"directory_select"}>
                                        <Upload directory={true}>
                                            <Button>
                                                <UploadOutlined /> Select A Directory
                                            </Button>
                                        </Upload>
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
