
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
                        <StatusBox getCall={'status_box_webdb_get'} replyCall={'status_box_webdb_reply'} title={"Local MySql Connection"}/>
                    </Col>

                    <Col flex={4} span={8}>
                        <StatusBox getCall={'status_box_remotedb_get'} replyCall={'status_box_remotedb_reply'} title={"Remote Server Access"}/>
                    </Col>
                </Row>
            </div>
        );
    }
}

