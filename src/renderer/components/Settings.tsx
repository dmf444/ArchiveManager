import {Divider, Form, Input, Row} from "antd";
import * as React from 'react';


export class Settings extends React.Component {


    render() {
        return (
            <Form name="basic" initialValues={{ remember: true }} layout={"inline"}/*onFinish={onFinish} onFinishFailed={onFinishFailed}*/>
                <Divider orientation="left">Discord Settings</Divider>
                    <Form.Item label="Discord Token" name="token" wrapperCol={{span: 16}}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Discord Channel" name="channel">
                        <Input />
                    </Form.Item>
            </Form>

        );
    }


}