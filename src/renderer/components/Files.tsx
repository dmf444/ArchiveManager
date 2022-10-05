
import * as React from 'react';

import '@public/style.css';
import {Col, Divider, Layout, Row} from 'antd';

const { Header, Content, Footer, Sider } = Layout;
const log = require('electron-log');
import 'antd/dist/antd.css';
import {FileCard} from '@/renderer/components/files/FileCard';
import {FileInfo} from './files/FileInfo';
import {FileModel} from "@main/file/FileModel";
import {ipcRenderer} from "electron";
import {Uploader} from "@/renderer/components/files/Uploader";
import {GroupModel} from '@main/group/models/GroupModel';
import {FileColumns} from '@/renderer/components/common/FileColumns';

interface CardInfoProps {
    cardInfoOpen: boolean
}

interface CardInfoState {
    cardInfoOpen: boolean,
    allCards: (FileModel|GroupModel)[],
    newCards: FileModel[],
    currentEditingCard: FileModel,
    uploadingPage: boolean
}

export class Files extends React.Component<{insHeader: any, setEditing: (type: 'group' | 'file', id: number) => void}, CardInfoState> {

    constructor(props) {
        super(props);
        this.state = {
            cardInfoOpen: false,
            allCards: null,
            newCards: null,
            currentEditingCard: null,
            uploadingPage: false
        }
        this.openFileInfo = this.openFileInfo.bind(this);
        this.closeFileInfo = this.closeFileInfo.bind(this);
        this.updateAllCardsState = this.updateAllCardsState.bind(this);
        ipcRenderer.on('files_get_normal_reply', this.updateAllCardsState);
        this.updateNewCardState = this.updateNewCardState.bind(this);
        ipcRenderer.on('files_get_new_reply', this.updateNewCardState);

    }

    componentDidMount(): void {
        ipcRenderer.send('files_get_normal', []);
        ipcRenderer.send('files_get_new', []);
    }

    componentWillUnmount(): void {
        ipcRenderer.removeListener('files_get_normal_reply', this.updateAllCardsState);
        ipcRenderer.removeListener('files_get_new_reply', this.updateNewCardState);
    }

    updateAllCardsState(event, args: (FileModel|GroupModel)[]){
        this.setState({allCards: args});
    }

    setEditingFile = (file: FileModel|GroupModel) => {
        if(file instanceof GroupModel) {
            this.props.setEditing('group', file.id);
            return;
        }
        if(!(file instanceof FileModel)){
            let info = FileModel.fromJson(file);
            this.setState({currentEditingCard: info});
        }
    }

    updateNewCardState(event, args: FileModel[]) {
        this.setState({newCards: args});
    }

    removeFileFromUI = (file: FileModel) => {
        let index: number = this.state.allCards.findIndex((fileModel: FileModel) => {
           return fileModel.id == file.id;
        });
        this.state.allCards.splice(index, 1);
        this.setState({allCards: this.state.allCards});
    }


    openFileInfo = (event: React.MouseEvent) => {
        event.preventDefault();
        if(this.state.currentEditingCard != null) {
            this.setState({cardInfoOpen: true});
        }
        return {CardInfoProps : this.state.cardInfoOpen};
    }

    closeFileInfo = (event: React.MouseEvent) => {
        event.preventDefault();
        this.setState({cardInfoOpen: false});
        this.props.insHeader(null);
        setTimeout(this.delayedUpdate, 100);
        return {CardInfoProps : this.state.cardInfoOpen};
    }

    closeUploadingPage = (event: React.MouseEvent) => {
        event.preventDefault();
        this.setState({cardInfoOpen: false, uploadingPage: false});
        this.props.insHeader(null);
        setTimeout(this.delayedUpdate, 100);
        return {CardInfoProps : this.state.cardInfoOpen};
    }

    delayedUpdate = () => {
        ipcRenderer.send('files_get_normal', []);
        ipcRenderer.send('files_get_new', []);
    }

    buildColumns(startIndex: number, files?: FileModel[]) {
        var rowRenderData = [];
        let models: FileModel[] = files.slice(startIndex, startIndex+3);
        for(let i = 0; i < models.length; i++) {
            let keyBase: string = "row" + startIndex + "_col" + i;
            rowRenderData.push(
                <Col span={8} key={keyBase + "_column"}>
                    <FileCard infoOpen={this.openFileInfo} filterFile={this.removeFileFromUI} cardInfo={models[i]} key={keyBase + "_card"} setCardEditing={this.setEditingFile}/>
                </Col>
            );
        }
        return rowRenderData;
    }

    generateCards = (files?: FileModel[]) => {
        var fileRenderData = [];
        if(files != null){
            for (let i = 0; i < files.length; i=i+3){
                fileRenderData.push(
                    <Row gutter={[8,8]} key={"row" + i}>
                        {this.buildColumns(i, files)}
                    </Row>
                );
            }
        }

        return fileRenderData;
    }

    generateNew = () => {
        var fileRenderData = [];
        if(this.state.newCards != null){
            fileRenderData.push(<Divider key={"new_files"} orientation={'left'}>New</Divider>);
            fileRenderData.push(this.generateCards(this.state.newCards));
        }
        return fileRenderData;
    }

    render() {
        return(
            <div className="filesComp">
                <div className="files" style={{ display: !this.state.cardInfoOpen ? "block" : "none"}}>
                    {this.generateNew()}
                    <Divider orientation={'left'}>Files</Divider>
                    <FileColumns fileCardList={this.state.allCards} deleteFileHandler={this.removeFileFromUI} openEditorCallback={this.openFileInfo} setActiveCardCallback={this.setEditingFile}/>
                </div>

                {this.state.cardInfoOpen && !this.state.uploadingPage && <FileInfo infoClose={this.closeFileInfo} insertHeaderFunc={this.props.insHeader} editingCard={this.state.currentEditingCard} uploadSwitch={() => {this.setState({uploadingPage: true})}}/>}
                {this.state.uploadingPage && <Uploader headerControl={this.props.insHeader} fileId={this.state.currentEditingCard.id} resetFiles={this.closeUploadingPage}/>}
            </div>
        );
    }
}
