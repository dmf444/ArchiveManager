
import * as React from 'react';

import '@public/style.css';
import { Layout } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';

import * as Status from './home/Status';
import * as AddFiles from './home/AddFiles';

export class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
            <div className="homeComp">
                <Status.Status>    
                </Status.Status>

                <AddFiles.AddFiles>
                </AddFiles.AddFiles>                
            </div>
        );
    }
}
