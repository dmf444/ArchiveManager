
import * as React from 'react';

import '@public/style.css';
import { Upload, message, Row, Col, Divider } from 'antd';
import { FileOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

import 'antd/dist/antd.css';

export class AddFiles extends React.Component {
    
    render() {
        return(
            <div className="addFilesComp">
                <div>
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
                </div>

                <Dragger>
                    <p className="ant-upload-drag-icon">
                        <FileOutlined />
                    </p>
                    <p className="ant-upload-text">
                        Click or drag file to this area to upload UWU
                    </p>
                </Dragger>
            </div>
        );
    }
}
