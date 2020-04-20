import {Divider, Form, Input, Row} from "antd";
import * as React from 'react';


export class Settings extends React.Component {


    render() {
        return (
            <Form name="basic" initialValues={{ remember: true }} /*onFinish={onFinish} onFinishFailed={onFinishFailed}*/>
                <Divider orientation="left">Discord Settings</Divider>
                <div>
                    <Form.Item label="Discord Token" name="token" labelCol={{span: 12, offset: -1}}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Discord Channel" name="channel" labelCol={{span: 17}}>
                        <Input />
                    </Form.Item>
                </div>
            </Form>
        );
    }


}