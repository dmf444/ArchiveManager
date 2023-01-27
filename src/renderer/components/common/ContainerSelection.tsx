import React from "react";
import {Form, Select} from "antd";
import {ipcRenderer} from "electron";
const { Option } = Select;

type containerRespType = {
    id: number,
    name: string
}
export class ContainerSelection extends React.Component<{ ipcSendEventName: string }, { options: containerRespType[] }> {

    public static defaultProps = {
        ipcSendEventName: 'file_edit_container'
    }

    constructor(props) {
        super(props);
        this.state = {
            options: [{id: 0, name: "Digital File"}],
        };


        this.setContainerOptions = this.setContainerOptions.bind(this);
        ipcRenderer.on('file_edit_get_containers_reply', this.setContainerOptions);
    }

    componentDidMount(): void {
        ipcRenderer.send('file_edit_get_containers', null);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('file_edit_get_containers_reply', this.setContainerOptions);
    }

    setContainerOptions(event, args: any[]) {
        if(args != null) {
            this.setState({options: args});
        }
    }

    renderContainerOptions = () => {
        let options = [];
        this.state.options.forEach((optionList) => {
            options.push(<Option value={optionList.id} key={"containerselect_" + optionList.id}>{optionList.name}</Option>);
        });
        return options;
    };

    sendContainerChange = (changed, all) => {
        ipcRenderer.send(this.props.ipcSendEventName, changed);
    }

    public render() {
        return (
            <Form.Item label={"Container"} name={"container_sel"}>
                <Select onChange={this.sendContainerChange}
                    showSearch={true}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    { this.renderContainerOptions() }
                </Select>
            </Form.Item>
        );
    }
}