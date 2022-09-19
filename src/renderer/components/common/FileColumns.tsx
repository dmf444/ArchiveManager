import React from "react";
import {FileModel} from "@main/file/FileModel";
import {Col, Row} from "antd";
import {FileCard} from "@/renderer/components/files/FileCard";
import {GroupModel} from "@main/group/models/GroupModel";


export class FileColumns extends React.Component<{ fileCardList: (FileModel|GroupModel)[] | null, deleteFileHandler: any, openEditorCallback: any, setActiveCardCallback: any }, any> {

    buildColumns(startIndex: number, files?: (FileModel|GroupModel)[]) {
        var rowRenderData = [];
        let models: (FileModel|GroupModel)[] = files.slice(startIndex, startIndex+3);
        for(let i = 0; i < models.length; i++) {
            let keyBase: string = "row" + startIndex + "_col" + i;
            let model: FileModel = FileModel.fromJson({});
            Object.assign(model, models[i]);
            rowRenderData.push(
                <Col span={8} key={keyBase + "_column"}>
                    <FileCard infoOpen={this.props.openEditorCallback} filterFile={this.props.deleteFileHandler} cardInfo={model} key={keyBase + "_card"} setCardEditing={this.props.setActiveCardCallback}/>
                </Col>
            );
        }
        return rowRenderData;
    }

    generateCards = () => {
        let files = this.props.fileCardList;
        var fileRenderData = [];
        if(files != null){
            for (let i = 0; i < files.length; i=i+3){
                fileRenderData.push(
                    <Row gutter={[8,8]} key={"row" + i}>
                        { this.buildColumns(i, files) }
                    </Row>
                );
            }
        }

        return fileRenderData;
    }


    public render() {
        return (
            <div>
                { this.generateCards() }
            </div>
        );
    }
}