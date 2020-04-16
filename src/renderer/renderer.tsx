/**
 * React renderer.
 */

import * as React from 'react';
import * as ReactDOM from 'react-dom';

// Import the styles here to process them with webpack
import '@public/style.css';
import { Layout, Menu } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';

import {ContentSurround} from './components/ContentSurround';
ReactDOM.render(<ContentSurround/>, document.getElementById('app'));

