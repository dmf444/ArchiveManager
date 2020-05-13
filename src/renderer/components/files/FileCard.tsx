import * as React from 'react';
import {Card, Col, Row} from 'antd';
import { EditTwoTone, FileOutlined, SettingOutlined} from '@ant-design/icons/lib';

import {FileInfo} from './FileInfo';


export class FileCard extends React.Component{

    constructor(props) {
        super(props);
    }

    state = {
        cardInfoOpen: false
    }

    openFileInfo = event => {
        this.setState({cardInfoOpen: true})
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
                            <EditTwoTone onClick={this.openFileInfo} style={{fontSize: "2em"}}/>
                        </Col>
                    </Row>
                </Card>
                {this.state.cardInfoOpen && <FileInfo/>}
            </div>
        );
    }
}