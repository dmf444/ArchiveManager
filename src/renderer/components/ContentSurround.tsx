import * as React from 'react';
import {
    FileAddOutlined,
    HomeOutlined,
    SettingOutlined
} from '@ant-design/icons';
import '@public/style.css';
import { Layout, Menu } from 'antd';
import { Home } from './Home';

const { Content, Footer, Sider } = Layout;

export class ContentSurround extends React.Component{

    state = {
        collapsed: false,
        currentSelection: 'Home'
    };

    onCollapse = collapsed => {
        document.getElementById('contentBox').style.marginLeft = collapsed ? "80px": "200px";
        this.setState({ collapsed });
    };

    changeToHome = event => {
        event.preventDefault();
        this.setState({ currentSelection: 'Home' });
    };

    changeToFiles = event => {
        event.preventDefault();
        this.setState({ currentSelection: 'Files' });
    }

    changeToSettings = event => {
        event.preventDefault();
        this.setState({ currentSelection: 'Settings' });
    }

    render() {
        return (
        <Layout>
            <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}
                   style={{
                       overflow: 'auto',
                       height: '100vh',
                       position: 'fixed',
                       left: 0
                   }}
            >
                <div className='logo' />
                <Menu theme='dark' mode='inline' defaultSelectedKeys={['1']} style={{height: "100%", display: "flex", flexWrap: "wrap", alignContent: "flex-start"}}>
                    <Menu.Item key='1' onClick={this.changeToHome}>
                        <HomeOutlined />
                        <span className='nav-text'>Home</span>
                    </Menu.Item>
                    <Menu.Item key='2' onClick={this.changeToFiles}>
                        <FileAddOutlined />
                        <span className='nav-text'>Files</span>
                    </Menu.Item>


                    <Menu.Item key='3' style={{position: 'absolute', bottom: '47px'}} onClick={this.changeToSettings}>
                        <SettingOutlined />
                        <span className='nav-text'>Settings</span>
                    </Menu.Item>
                </Menu>
            </Sider>
            <Layout className='site-layout' style={{ marginLeft: 200 }} id="contentBox">
                <Content style={{ margin: '24px 16px 0', overflow: 'initial' }} >
                    <div className='site-layout-background' style={{ padding: 24, textAlign: 'center' }}>
                        {this.state.currentSelection == 'Home' && <Home {...this.props} />}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>DMF Productions ©2020 Created by DMF & PO</Footer>
            </Layout>
        </Layout>
        );
    }
}