
import * as React from 'react';

import '@public/style.css';
import { Layout } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';

export class Files extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
            <div className="filesComp">
                <p>Files uwu</p>               
            </div>
        );
    }
}
