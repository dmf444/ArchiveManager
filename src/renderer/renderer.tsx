/**
 * React renderer.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import the styles here to process them with webpack
import {
    FileAddOutlined,
    HomeOutlined,
    SettingOutlined
} from '@ant-design/icons';
import '@public/style.css';
import { Layout, Menu } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';


import {ContentSurround} from './components/ContentSurround';
ReactDOM.render(<ContentSurround/>, document.getElementById('app'));
/*ReactDOM.render(
    <Layout>
        <Sider collapsible
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0
            }}
        >
            <div className='logo' />
            <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} style={{height: "100%", display: "flex", flexWrap: "wrap", alignContent: "flex-start"}}>
                <Menu.Item key='1'>
                    <HomeOutlined />
                    <span className='nav-text'>Home</span>
                </Menu.Item>
                <Menu.Item key='2'>
                    <FileAddOutlined />
                    <span className='nav-text'>Files</span>
                </Menu.Item>


                <Menu.Item key='3' style={{position: 'absolute', bottom: '47px'}}>
                    <SettingOutlined />
                    <span className='nav-text'>Settings</span>
                </Menu.Item>
            </Menu>
        </Sider>
        <Layout className='site-layout'>
            <Header className='site-layout-background' style={{ padding: 0 }} />
            <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
                <div className='site-layout-background' style={{ padding: 24, textAlign: 'center' }}>
                    ...
                    <br />
                    Really
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    long
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    ...
                    <br />
                    content
                </div>
            </Content>
            <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
        </Layout>
    </Layout>,
    document.getElementById('app')
);*/
