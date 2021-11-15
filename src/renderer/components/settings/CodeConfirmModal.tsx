import * as React from 'react';
import {Form, Input, Modal} from "antd";
import {FormInstance} from "antd/lib/form";
import {ipcRenderer} from "electron";
import log from "electron-log";

type modalProps = {
    registerFunction: (any) => void
}
export class CodeConfirmModal extends React.Component< modalProps, any> {

    private form = React.createRef<FormInstance>();
    state = {
        visible: false
    }

    componentDidMount() {
        this.props.registerFunction(this.setVisibility);
    }

    private setVisibility = (newState: boolean) => {
        this.setState({visible: newState});
    }

    sendValuesToBackend = (values) => {
        ipcRenderer.send('code_verification', 'google', values);
        this.setVisibility(false);
    }


    public render() {
        return (
            <Modal
                title="Confirmation Code"
                centered
                visible={this.state.visible}
                onOk={() => {
                    this.form.current.validateFields().then(values => {
                        log.warn(values);
                        this.sendValuesToBackend(values);
                        this.form.current.resetFields();
                    })
                }}
                onCancel={() => this.setVisibility(false)}
            >
                <p>Please submit the code returned from the OAuth2 approval.</p>
                <Form ref={this.form} layout="vertical" name="code_submit">
                    <Form.Item label="Code" name={"code"}>
                        <Input placeholder="google verification code"/>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }

}