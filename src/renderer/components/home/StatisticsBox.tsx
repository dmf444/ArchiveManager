import * as React from 'react';
import {Card, Statistic} from "antd";
import {ArrowUpOutlined} from "@ant-design/icons/lib";
import {ipcRenderer} from "electron";

type StatisticsProps = {
    replyCall: string,
    getCall: string,
    title: string,
    color: string,
    prefix: any
}

export class StatisticsBox  extends React.Component<StatisticsProps, any>{

    state = {
        loading: true,
        stats: null
    };

    constructor(props) {
        super(props);
        this.updateStatus = this.updateStatus.bind(this);
        ipcRenderer.on(this.props.replyCall, this.updateStatus);

    }

    componentDidMount(): void {
        ipcRenderer.send(this.props.getCall, []);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener(this.props.replyCall, this.updateStatus);
    }

    updateStatus(event, args){
        this.setState({loading: false, stats: args});
    }

    getStats = () => {
        if(this.state.stats != null) {
            return (
                <Statistic
                    title={this.props.title}
                    value={this.state.stats}
                    precision={0}
                    valueStyle={{ color: this.props.color }}
                    prefix={this.props.prefix}
                    suffix="Files"
                />
            );
        }
        return <p>Something broke...</p>;
    }

    render(): React.ReactNode {
        return (
            <Card size="small" loading={this.state.loading}>
                {this.getStats()}
            </Card>
        );
    }
}