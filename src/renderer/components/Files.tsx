
import * as React from 'react';

import '@public/style.css';
import {Col, Divider, Layout, Row} from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';
import {FileCard} from '@/renderer/components/files/FileCard';
import {FileInfo} from './files/FileInfo';

interface CardInfoProps {
    cardInfoOpen: boolean
}

interface CardInfoState {
    cardInfoOpen: boolean
}

export class Files extends React.Component<{}, CardInfoState> {
    
    constructor(props) {
        super(props);
        this.state = {
            cardInfoOpen: false
        }
        this.openFileInfo = this.openFileInfo.bind(this);
        this.closeFileInfo = this.closeFileInfo.bind(this);
    }

    openFileInfo = (event: React.MouseEvent) => {
        event.preventDefault();
        this.setState({cardInfoOpen: true});
        return {CardInfoProps : this.state.cardInfoOpen};
    }

    closeFileInfo = (event: React.MouseEvent) => {
        event.preventDefault();
        this.setState({cardInfoOpen: false});
        return {CardInfoProps : this.state.cardInfoOpen};
    }

    render() {
        return( 
            <div className="filesComp">
                <div className="files" style={{ display: !this.state.cardInfoOpen ? "block" : "none"}}>
                    <Divider orientation={'left'}>Files</Divider>
                        <Row gutter={[8,8]}>
                            <Col span={8}>
                                <FileCard infoOpen={this.openFileInfo}/>
                            </Col>
                            <Col span={8}>
                                <FileCard infoOpen={this.openFileInfo}/>
                            </Col>
                            <Col span={8}>
                                <FileCard infoOpen={this.openFileInfo}/>
                            </Col>
                        </Row>
                        <Row gutter={[8,8]}>
                            <Col span={8}>
                                <FileCard infoOpen={this.openFileInfo}/>
                            </Col>
                            <Col span={8}>
                                <FileCard infoOpen={this.openFileInfo}/>
                            </Col>
                            <Col span={8}>
                                <FileCard infoOpen={this.openFileInfo}/>
                            </Col>
                        </Row>
                </div>
                
                {this.state.cardInfoOpen && <FileInfo infoClose={this.closeFileInfo} />}
            </div>
        );
    }
}
