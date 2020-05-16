
import * as React from 'react';

import '@public/style.css';
import { Layout, Row, Col, Typography } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;

import 'antd/dist/antd.css';
import '../../style/home/Status.css';
import {StatusBox} from "@/renderer/components/home/StatusBox";

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
                        <StatusBox getCall={'status_box_discord_get'} replyCall={'status_box_discord_reply'} title={"Discord Bot"}/>
                    </Col>
                    <Col flex={4} span={8}>
                        <StatusBox getCall={'status_box_webdb_get'} replyCall={'status_box_webdb_reply'} title={"Remote Database"}/>
                    </Col>

                    <Col flex={4} span={8}>
                        <div className="tbd">
                            <Row justify="start">
                                <Col>
                                    <Title level={4}>Placeholder Status</Title>
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

