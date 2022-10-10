
import * as React from 'react';

import '@public/style.css';


import 'antd/dist/antd.css';

import {Status} from "@/renderer/components/home/Status";
import {Statistics} from "@/renderer/components/home/Statistics";
import {AddFiles} from "@/renderer/components/home/AddFiles";



export class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return( 
            <div className="homeComp">
                <Status/>
                <Statistics/>
                <AddFiles/>
            </div>
        );
    }
}

const styles = {
    divProps: {
        style: { fontSize:'25px', color:'#d9d9d9'}
    }
}