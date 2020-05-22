
import * as React from 'react';

import '@public/style.css';
import {Layout, Row, Col, Divider, Typography, Card, Statistic} from 'antd';

const { Title } = Typography;

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';
import {ArrowUpOutlined, LineOutlined} from "@ant-design/icons/lib";
import {StatisticsBox} from "@/renderer/components/home/StatisticsBox";

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
                        <StatisticsBox replyCall={'stats_new_files_reply'} getCall={'stats_new_files'} title={"New"} color={'#3f8600'} prefix={<ArrowUpOutlined />}/>
                    </Col>

                    <Col flex={4} span={8}>
                        <StatisticsBox replyCall={'stats_all_files_reply'} getCall={'stats_all_files'} title={"Total"} color={'#595959'} prefix={<LineOutlined />}/>
                    </Col>
                    <Col flex={4} span={8}>
                        <StatisticsBox replyCall={'stats_error_files_reply'} getCall={'stats_error_files'} title={"Errors"} color={'#cf1322'} prefix={<LineOutlined />}/>
                    </Col>
                </Row>
            </div>
        );
    }
}
