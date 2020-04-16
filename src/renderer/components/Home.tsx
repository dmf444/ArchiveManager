
import * as React from 'react';

import '@public/style.css';
import { Layout } from 'antd';

const { Header, Content, Footer, Sider } = Layout;
import 'antd/dist/antd.css';

import * as Status from './home/Status';

export class Home extends React.Component {
    
    render() {
        return( 
            <div className="homeComp">
                <Status.Status>
                    
                    
                    

                    
                </Status.Status>                
            </div>
        );
    }
}
