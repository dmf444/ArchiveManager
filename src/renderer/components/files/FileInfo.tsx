import * as React from 'react';
import {Card, Col, Row, Button, Divider, Input, Typography, Form, Select} from 'antd';

const { Option } = Select;
const log = require('electron-log');
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
        this.props.insertHeaderFunc(
            <Button onClick={this.props.infoClose}><LeftOutlined />Go Back</Button>
        );
    }

    private timer = null;

    changeEvent = (changed, all) => {
        clearTimeout(this.timer);
        this.timer = setTimeout(this.submitForm, 750);
    }

    submitForm = () => {
        log.info("Submitted!")
    }

    render() {
        return (
            <div className="fileInfo">
                <Form onValuesChange={this.changeEvent}>
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
                            <Form.Item>
                                <Select>
                                    <Option value={0}>Everyone</Option>
                                    <Option value={1}>Logged In</Option>
                                    <Option value={2}>Music Library</Option>
                                    <Option value={3}>Staff</Option>
                                    <Option value={4}>Special Access</Option>
                                    <Option value={5}>Administrator</Option>
                                </Select>
                            </Form.Item>

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
                            <Form.Item name={"description"}>
                                <TextArea rows={6} placeholder="Description"/>
                            </Form.Item>

                        </Col>
                    </Row>
                </Form>
            </div>
        );
    }
}