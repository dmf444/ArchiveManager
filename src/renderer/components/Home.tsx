
import * as React from 'react';

import '@public/style.css';
import { Button, Col, Form, Input, Layout, Row, Upload, Typography } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const { Title } = Typography;
import 'antd/dist/antd.css';

import * as AddFiles from './home/AddFiles';
import * as Statistics from './home/Statistics';
import * as Status from './home/Status';

import {UploadOutlined} from "@ant-design/icons/lib";

export class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
            <div className="homeComp">
                <Status.Status>    
                </Status.Status>

                <Statistics.Statistics>
                </Statistics.Statistics>

                <AddFiles.AddFiles>
                </AddFiles.AddFiles>

            </div>
        );
    }
}

const styles = {
    divProps: {
        style: { fontSize:'25px', color:'#d9d9d9'}
    }
}