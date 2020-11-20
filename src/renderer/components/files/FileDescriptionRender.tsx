import * as React from "react";
import {Col, Input, Form, Select, Row} from "antd";
import {ipcRenderer} from "electron";
const { TextArea } = Input;
const log = require('electron-log');


export class FileDescriptionRender extends React.Component<{ version: string, data: string, onChange: any }, { jsonObjEditable: any, format: any }> {

    state = {
        jsonObjEditable: null,
        format: null
    }


    constructor(props) {
        super(props);

        this.updateDescriptionFormat = this.updateDescriptionFormat.bind(this);
        ipcRenderer.on('file_description_format_reply', this.updateDescriptionFormat);
    }

    componentDidMount(): void {
        // log.info("Incoming", this.props.data);
        if(this.props.data == null || this.props.data === "") {
            this.setState({jsonObjEditable: JSON.parse("{}")});
        } else {
            this.setState({jsonObjEditable: JSON.parse(this.props.data)});
        }
        if(this.props.version != null) {
            ipcRenderer.send('file_description_format_get', this.props.version);
        }
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('file_description_format_reply', this.updateDescriptionFormat)
    }

    private updateDescriptionFormat(event, format) {
        //if(format != null) {
            this.setState({format: format});
        //}
    }

    private sendStateUpdateToFile() {
        if(this.state.jsonObjEditable != null) {
            //log.info(JSON.stringify(this.state.jsonObjEditable));
            this.props.onChange(JSON.stringify(this.state.jsonObjEditable));
        }
    }


    private textTimer = null;
    private onInputChange(name, e) {
        //log.info(name, e.target.value);
        clearTimeout(this.textTimer);
        this.textTimer = setTimeout(this.updateText.bind(this), 750, name, e.target.value);
    }

    private updateText(name: string, text: string) {
        const currentValues = {...this.state.jsonObjEditable};
        currentValues[name] = text;
        this.setState({jsonObjEditable: currentValues}, this.sendStateUpdateToFile);
    }

    private onSelectChange(name, ee) {
        const currentValues = {...this.state.jsonObjEditable};
        currentValues[name] = ee;
        this.setState({jsonObjEditable: currentValues}, this.sendStateUpdateToFile);
    }


    public createInputField = (item: string) => {
        let capitalName = item[0].toUpperCase() + item.substring(1);
        return (
            <Col span={8}>
                <Form.Item label={capitalName} name={item}>
                    <Input onChange={event => this.onInputChange(item, event)}/>
                </Form.Item>
            </Col>
        );
    };

    createTextAreaField = (item: string) => {
        let capitalName = item[0].toUpperCase() + item.substring(1);
        return (
            <Col span={24}>
                <Form.Item label={capitalName} name={item}>
                    <TextArea rows={4} onChange={event => this.onInputChange(item, event)}/>
                </Form.Item>
            </Col>
        );
    };


    createSelectField = (item: string) => {
        let capitalName = item[0].toUpperCase() + item.substring(1);
        return (
            <Col span={24}>
                <Form.Item label={capitalName} name={item}>
                    <Select mode="tags" style={{ width: '100%' }} onChange={(value, options) => this.onSelectChange(item, value)}/>
                </Form.Item>
            </Col>
        );
    };

    public getRenderContent() {
        if(this.state.format != null) {
            let renderedContent = [];
            Object.keys(this.state.format).forEach(key => {
               let value = this.state.format[key];
               switch (value) {
                   case "textarea":
                       renderedContent.push(this.createTextAreaField(key));
                       break;
                   case "text":
                       renderedContent.push(this.createInputField(key));
                       break;
                   case "select":
                       renderedContent.push(this.createSelectField(key));
                       break;
               }
            });
            return renderedContent;
        } else {
            return (<p>No Content</p>);
        }
    }

    render(): React.ReactNode {
        return (
            <Row style={{width: "100%"}}>
                { this.getRenderContent() }
            </Row>
        );

    }

}