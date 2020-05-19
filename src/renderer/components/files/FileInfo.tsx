import * as React from 'react';
import {Card, Col, Row, Button, Divider, Input, Typography} from 'antd';

const { Text, Title } = Typography;
const { TextArea } = Input;
import {EditTwoTone, FileOutlined, LeftOutlined, SettingOutlined} from '@ant-design/icons/lib';

interface FileProps {
    infoClose: (event: React.MouseEvent) => void
    insertHeaderFunc: any
}

export class FileInfo extends React.Component<FileProps, {}>{

    constructor(props) {
        super(props);
        this.props.insertHeaderFunc(<Button onClick={this.props.infoClose}><LeftOutlined />Go Back</Button>);
    }

    render() {
        return (
            <div className="fileInfo">
                
                {/*
                    File description
                */}
                <Row gutter={16}>
                    <Col span={8}>
                        <Card>
                            File Preview (snapshot of PDF or small img)
                        </Card>
                    </Col>
                    
                    <Col span={16}>
                        <Row gutter={[40, 16]}>
                            <Col span={4}>
                                <Text>File Name</Text>
                            </Col>
                        </Row>
                        <Row gutter={[40, 16]}>
                            <Col span={4}>
                                <Text>File Size</Text>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <a href="">File Open Link</a>
                            </Col>
                            <Col span={12}>
                                <a href="">URL Open Link</a>
                            </Col>
                        </Row>

                        <Row>
                            <Col span={12}>
                                <a href="">Downloader</a>
                            </Col>
                            <Col span={12}>
                                <a href="">Redownload</a>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Divider 
                    orientation="left" 
                    style={{
                        fontSize: "20px"
                    }}>File Info
                </Divider>

                {/*
                    File metadata                
                */}
                <Row gutter={[40, 16]}>
                    <Col span={24}>
                        <Input placeholder="File Name"/>
                    </Col>
                </Row>

                <Row gutter={[40, 16]}>
                    <Col span={24}>
                        <Input placeholder="Restriction(s)"/>
                    </Col>
                </Row>

                <Row gutter={[40, 16]}>
                    <Col span={8}>
                        <Text>Page Count</Text>
                    </Col>
                    
                    <Col span={8}>
                        <Text>Container</Text>
                    </Col>

                    <Col span={8}>
                        <Text>Revision Number</Text>
                    </Col>
                </Row>

                {/*
                    File description
                */}
                <Row gutter={[40, 16]}>
                    <Col span={24}>
                        <TextArea rows={4} placeholder="Description"/>
                    </Col>
                </Row>

                <Row gutter={12} justify="space-between" align="middle">
                    <Col>
                        <Button type="primary">Submit</Button>
                    </Col>
                </Row>
            </div>
        );
    }
}