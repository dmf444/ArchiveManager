
import * as React from 'react';

import '@public/style.css';
import { Button, Col, Form, Input, Layout, Row, Upload, Typography, Divider } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;
import 'antd/dist/antd.css';

import * as AddFiles from './home/AddFiles';
import * as Statistics from './home/Statistics';
import * as Status from './home/Status';

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

                <div>
                    <Row justify="start">
                        <Col>
                            <Row>
                                <Col>
                                    <Title level={3}>Statistics</Title>
                                </Col>
                            </Row>    
                        </Col>
                    </Row>
                    <Divider orientation="left" style={{fontSize:'25px', color:'#d9d9d9'}}>Statistics</Divider>
                    <Statistics.Statistics>
                    </Statistics.Statistics>
                </div>


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

const styles = {
    divProps: {
        style: { fontSize:'25px', color:'#d9d9d9'}
    }
}