
import * as React from 'react';

import '@public/style.css';
import { Button, Input, Upload, message, Row, Col, Form, Divider } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

import {UploadOutlined} from "@ant-design/icons/lib";
import 'antd/dist/antd.css';
import {ipcRenderer} from "electron";

export class AddFiles extends React.Component {

    finish = values => {
      if(values['url'] != null && values['url'] != ""){
          ipcRenderer.send('homepage_url_add', values['url']);
      }
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
                <Form name={"add_files"} layout={"vertical"} onFinish={this.finish}>
                    <Row gutter={6}>
                        <Col flex={6}>
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
                                        <Upload directory>
                                            <Button>
                                                <UploadOutlined /> Select A Directory
                                            </Button>
                                        </Upload>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }
}
