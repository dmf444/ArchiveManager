
import * as React from 'react';

import '@public/style.css';
import {Button, Col, Form, Input, Layout, Row, Upload} from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';

import * as Status from './home/Status';
import * as AddFiles from './home/AddFiles';
import {UploadOutlined} from "@ant-design/icons/lib";

export class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
            <div className="homeComp">
                <Status.Status>    
                </Status.Status>

                <Row>
                    <Col flex={4}>
                        <AddFiles.AddFiles>
                        </AddFiles.AddFiles>
                    </Col>
                    <Col flex={8}>
                        <Form.Item label="Add File By URL" name="url">
                            <Input />
                        </Form.Item>
                        <Upload action="https://www.mocky.io/v2/5cc8019d300000980a055e76" directory>
                            <Button>
                                <UploadOutlined /> Select A Directory
                            </Button>
                        </Upload>
                    </Col>
                </Row>

            </div>
        );
    }
}
