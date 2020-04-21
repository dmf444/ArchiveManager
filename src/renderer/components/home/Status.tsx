
import * as React from 'react';

import '@public/style.css';
import { Layout, Row, Col, Typography } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

import 'antd/dist/antd.css';
import '../../style/home/Status.css';

export class Status extends React.Component {
    
    constructor(props) {
        super(props)

        // perform a fetch for the status
    }

    render() {
        return(
            <div className="statusComp">
                <Row gutter={[40, 16]} justify="start">
                    <Col flex={4} span={8}>
                        <div className="discStatus">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Discord Status</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <Col flex={4} span={8}>
                        <div className="dbStatus">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Database Status</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    <Col flex={4} span={8}>
                        <div className="tbd">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Placeholder Status</Title>
                                </Col>
                            </Row>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

