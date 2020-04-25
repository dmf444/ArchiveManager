import {Button, Col, Divider, Form, Input, notification, Row} from "antd";
import * as React from 'react';
import {ipcRenderer} from  'electron';
import {CheckCircleOutlined} from "@ant-design/icons/lib";


export class Settings extends React.Component {

    state = {
        data: null
    };

    constructor(props) {
        super(props);
        this.buildInternalForm = this.buildInternalForm.bind(this);
        ipcRenderer.on('setting_fields_get_reply', this.buildInternalForm);

    }

    componentDidMount(): void {
        ipcRenderer.send('settings_fields_get', []);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('setting_fields_get_reply', this.buildInternalForm);
    }

    buildInternalForm(event, args: []){
        this.setState({data: args});
    }

    createInputs(clientArgs: settingFrame, keyId: Number) {
        var formInputs = [];
        for (let j = 0; j < clientArgs.settings.length; j++) {
            let setting: settingValues = clientArgs.settings[j];
            let size = Math.round((24 * setting.size) / 100);


            formInputs.push(
                <Col span={size} key={"col_" + keyId + "_" + j} style={{paddingTop: 10}}>
                    <Form.Item label={setting.name} name={setting.id} key={"formitem_" + keyId + "_" + j} style={{padding: "5px"}}>
                        <Input defaultValue={setting.value} value={setting.value} key={"input_" + keyId + "_" + j}/>
                    </Form.Item>
                </Col>
            );
        }
        return formInputs;
    }

    createForm = () => {
        var internalFormList= [];
        if(this.state.data != null){
            for (let i = 0; i < this.state.data.length; i++) {
                let clientArgs: settingFrame = this.state.data[i];

                internalFormList.push(<Divider orientation="left" key={i}>{clientArgs.category}</Divider>);
                internalFormList.push(
                    <Row style={{width: "100%"}} key={"row_" + i}>
                        {this.createInputs(clientArgs, i)}
                    </Row>
                );
            }

            internalFormList.push(
                <Form.Item key={this.state.data.length}>
                    <Button type="primary" htmlType="submit" key={this.state.data.length + 1}>
                        Update Settings
                    </Button>
                </Form.Item>
            );

        }

        return internalFormList;
    }

    onFinish = values => {
        let returnData = [];

        for(let i = 0; i < this.state.data.length; i++) {
            let settingImpl: settingFrame = this.state.data[i];
            let thing = {};

            for(let j = 0; j < settingImpl.settings.length; j++) {
                let setting: settingValues = settingImpl.settings[j];
                if(values[setting.id] !== undefined){
                    thing[setting.id] = values[setting.id];
                } else {
                    thing[setting.id] = setting.value;
                }
            }
            returnData.push({category: settingImpl.id, data: thing});
        }

        ipcRenderer.send('settings_fields_update', returnData);
        notification.success({
            message: 'Update Success!',
            description:
                'The settings have been updated!',
            icon: <CheckCircleOutlined style={{ color: 'green' }}/>,
            placement: "bottomRight"
        });
    }


    render() {
        return (
            <Form name="basic" initialValues={{ remember: true }} layout={"vertical"} onFinish={this.onFinish} /*onFinishFailed={onFinishFailed}*/ >
                {this.createForm()}
            </Form>
        );
    }


}