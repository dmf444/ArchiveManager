import {Button, Col, Divider, Empty, Form, Input, notification, Row} from "antd";
import * as React from 'react';
import {ipcRenderer} from  'electron';
import {CheckCircleOutlined} from "@ant-design/icons/lib";
import {CodeConfirmModal} from "@/renderer/components/settings/CodeConfirmModal";


export class Settings extends React.Component {

    state = {
        data: null,
        listeners: []
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

    addListener = (listenFunc: any) => {
        let data = this.state.listeners;
        data.push(listenFunc);
        this.setState({listeners: data});
    }

    runListeners = () => {
        this.state.listeners.forEach(listener => {
           listener(true);
        });
    }

    authorizeAccount = () => {
        ipcRenderer.send('authenitication_url_generate', 'google');
        this.runListeners();
    }

    buildInternalForm(event, args: []){
        this.setState({data: args});
    }

    getInputField(setting: settingValues, key: number, index: number) {
        if(setting.type && setting.type == "password") {
            return <Input.Password defaultValue={setting.value} value={setting.value} key={`input_${key}_${index}`}/>;
        }
        return <Input defaultValue={setting.value} value={setting.value} key={`input_${key}_${index}`}/>;
    }

    getInputLabelHeader(setting: settingValues) {
        return !setting.name.includes("<") ? setting.name : (
            <div>
                <Row style={{height: "20px"}}>
                    <p style={{margin: 0}}>{setting.name.replace("<>", "")}</p>
                    <Button type={'link'} size={'small'} onClick={() => {this.authorizeAccount()}}>(Authorize Account)</Button>
                </Row>
            </div>
        );
    }

    createInputs(clientArgs: settingFrame, keyId: number) {
        return clientArgs.settings.map((setting, index) => {
            let displaySize = Math.round((24 * setting.size) / 100);

            return (
                <Col span={displaySize} key={`col_${keyId}_${index}`} style={{paddingTop: 10}}>
                    <Form.Item label={this.getInputLabelHeader(setting)} name={setting.id} key={`formitem_${keyId}_${index}`} style={{padding: "5px"}}>
                        { this.getInputField(setting, keyId, index) }
                    </Form.Item>
                </Col>
            );
        });
    }

    createForm = () => {
        if(this.state.data != null){
            let internalFormList = this.state.data.map((setting, index) => {
               return (
                   <>
                       <Divider orientation="left" style={{ fontSize: "20px" }} key={index}>{setting.category}</Divider>
                       <Row style={{width: "100%"}} key={`row_${index}`}>
                           {this.createInputs(setting, index)}
                       </Row>
                   </>
               );
            });

            internalFormList.push(
                <Form.Item key={this.state.data.length}>
                    <Button type="primary" htmlType="submit" key={this.state.data.length + 1}>
                        Update Settings
                    </Button>
                </Form.Item>
            );
            return internalFormList;

        }

        return [
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No settings were found to configure."}/>
        ];
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
            <div>
                <Form name="basic" initialValues={{ remember: true }} layout={"vertical"} onFinish={this.onFinish} /*onFinishFailed={onFinishFailed}*/ >
                    {this.createForm()}
                </Form>
                <CodeConfirmModal registerFunction={this.addListener}/>
            </div>
        );
    }


}