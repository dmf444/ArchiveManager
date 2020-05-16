import * as React from 'react';
import {Card, Col, Row} from 'antd';
import { EditTwoTone, FileOutlined, SettingOutlined} from '@ant-design/icons/lib';

interface FileProps {
    infoOpen: (event: React.MouseEvent) => void
}

export class FileCard extends React.Component<FileProps, {}>{

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <Card style={{ width: "100%" }}>
                    <Row justify={"space-between"} align={"middle"}>
                        <Col>
                            <Row style={{marginLeft: "-15px"}}>
                                <Col style={{paddingRight: "3px"}}>
                                    <FileOutlined style={{fontSize: "3em"}}/>
                                </Col>
                                <Col>
                                    <h4 style={{marginBottom: "0px"}}>This is the title of the file</h4>
                                    <h6 style={{textAlign: "left"}}>id number</h6>
                                </Col>
                            </Row>
                        </Col>
                        <Col style={{marginRight: "-15px"}}>
                            <EditTwoTone onClick={this.props.infoOpen} style={{fontSize: "2em"}}/>
                        </Col>
                    </Row>
                </Card>
            </div>
        );
    }
}