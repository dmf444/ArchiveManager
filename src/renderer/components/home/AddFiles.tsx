
import * as React from 'react';

import '@public/style.css';
import { Button, Input, Upload, message, Row, Col, Form, Divider } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

import {UploadOutlined} from "@ant-design/icons/lib";
import 'antd/dist/antd.css';

export class AddFiles extends React.Component {
    
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
                
                <Row gutter={6}>
                    <Col flex={12}>                        
                        <Dragger>
                            <p className="ant-upload-drag-icon">
                                <FileOutlined />
                            </p>
                            <p className="ant-upload-text">
                                Click or drag file to this area to upload
                            </p>
                        </Dragger>
                    </Col>

                    <Col flex={12}>
                        <Form.Item label="Add File By URL" name="url">
                            <Input />
                        </Form.Item>
                        <Row>
                            <Col>
                                <Upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" directory>
                                    <Button>
                                        <UploadOutlined /> Select A Directory
                                    </Button>
                                </Upload>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </div>
        );
    }
}
