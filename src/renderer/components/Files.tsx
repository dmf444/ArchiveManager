
import * as React from 'react';

import '@public/style.css';
import {Col, Divider, Layout, Row} from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';
import {FileCard} from '@/renderer/components/files/FileCard';

export class Files extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
            <div className="filesComp">
                <Divider orientation={'left'}>Files</Divider>
                <Row gutter={[8,8]}>
                    <Col span={8}>
                        <FileCard/>
                    </Col>
                    <Col span={8}>
                        <FileCard/>
                    </Col>
                    <Col span={8}>
                        <FileCard/>
                    </Col>
                </Row>
                <Row gutter={[8,8]}>
                    <Col span={8}>
                        <FileCard/>
                    </Col>
                    <Col span={8}>
                        <FileCard/>
                    </Col>
                    <Col span={8}>
                        <FileCard/>
                    </Col>
                </Row>
            </div>
        );
    }
}
