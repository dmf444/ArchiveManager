
import * as React from 'react';

import '@public/style.css';
import { Layout, Row, Col, Divider, Typography } from 'antd';

const { Title } = Typography;

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';

export class Statistics extends React.Component {
    
    render() {
        return(
            <div className="statsComp">
                <Row justify="start">
                    <Col>
                        <Row>
                            <Col>
                                <Divider 
                                    orientation="left" 
                                    style={{
                                        fontSize: "20px"
                                }}>Statistics
                                </Divider>
                            </Col>
                        </Row>    
                    </Col>
                </Row>

                <Row gutter={[40, 16]} justify="start">
                    <Col flex={4} span={8}>
                        <div className="discStatus">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Files</Title>
                                </Col>
                            </Row>
                            
                            {/*
                            Update the status dynamically
                            Change colors depending on up/down/etc.
                            */}
                            <Row justify="center">
                                <Col>
                                    <Title level={2}>PLACE HOLDER STATUS</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <Col flex={4} span={8}>
                        <div className="dbStatus">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Files</Title>
                                </Col>
                            </Row>
                            <Row justify="center">
                                <Col>
                                    <Title level={2}>PLACE HOLDER STATUS</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <Col flex={4} span={8}>
                        <div className="tbd">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Files</Title>
                                </Col>
                            </Row>
                            <Row justify="center">
                                <Col>
                                    <Title level={2}>PLACE HOLDER STATUS</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}
