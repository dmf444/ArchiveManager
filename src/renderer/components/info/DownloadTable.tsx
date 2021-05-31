import * as React from "react";
import {Progress, Table} from 'antd';
import {ipcRenderer} from 'electron';
const log = require('electron-log');

export class DownloadTable extends React.Component<any, any> {

    state = {
        downloadValues: []
    }

    constructor(props) {
        super(props);

        this.parseData = this.parseData.bind(this);
        ipcRenderer.on('download_list_reply', this.parseData);
    }

    componentDidMount(): void {
        ipcRenderer.send('download_list_get', '');
        this.startTimer();
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('download_list_reply', this.parseData);
    }

    private updateTimer = null;
    private startTimer() {
        //log.info(name, e.target.value);
        clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => { ipcRenderer.send('download_list_get', ''); this.startTimer(); }, 3000);
    }


    parseData = (event, data) => {
        let newValues = [];
        Object.entries(data).map((listThing) => {
            let key = listThing[0];
            let value: any = listThing[1];
            newValues.push({downurl: key, percent: value.percent});
        });
        this.setState({downloadValues: newValues});
    }

    private columns = [
        {
            title: 'Download URL',
            dataIndex: 'downurl',
            key: 'downurl',
            width: "45%",
            render: text => {
                return text.replace(/,/g, ".");
            }
        },
        {
            title: 'Completion',
            dataIndex: 'percent',
            key: 'percent',
            width: "55%",
            render: text => {
                let percent = parseFloat(text.slice(0, -1));
                let status = true;
                if (percent > 99.99){
                    status = false;
                }
                return <Progress percent={percent} status={status ? "active" : "success"} />
            }
        }
    ];

    public render() {
        return (
            <>
                <Table columns={this.columns} dataSource={this.state.downloadValues}/>
            </>
        );
    }

}