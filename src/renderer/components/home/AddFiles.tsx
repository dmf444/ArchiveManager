
import * as React from 'react';

import '@public/style.css';
import { Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const { Dragger } = Upload;

import 'antd/dist/antd.css';

export class AddFiles extends React.Component {
    
    render() {
        return(
            <div className="addFilesComp">
                <Dragger>
                    <p>
                        Click or drag file to this area to upload UWU
                    </p>
                </Dragger>
            </div>
        );
    }
}
