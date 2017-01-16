import React from 'react';
import {browserHistory} from 'react-router';

import Dialog from 'material-ui/lib/dialog';
import TextField from 'material-ui/lib/text-field';
import FlatButton from 'material-ui/lib/flat-button';
import CircularProgress from 'material-ui/lib/circular-progress';

class NoteModal extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            note: {
                title: null,
                content: null
            },
            titleEmpty: true,
            title: null
        }
    }

    handleClose() {
        this.setState({
            note: null,
            titleEmpty: false,
            title: null
        });
        this.props.onNoteModalClose();
    }

    handleSave() {
        this.props.onSaveNote(this.state.note);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            note: nextProps.note,
            title: nextProps.note.title,
            titleEmpty: false
        });
    }

    handleTitleChange(event) {
        let note = this.state.note;
        note.title = event.target.value;
        this.setState({
            titleEmpty: event.target.value.length === 0 ? true : false,
            note
        });
    }

    handleContentChange(event) {
        let note = this.state.note;
        note.content = event.target.value;
        this.setState({note});
    }

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                primary={true}
                onClick={this.handleClose.bind(this)}
            />,
            <FlatButton
                label="Submit"
                primary={true}
                disabled={this.state.titleEmpty}
                onClick={this.handleSave.bind(this)}
            />,
        ];
        return (
            <Dialog
                title={this.state.title}
                actions={actions}
                modal={false}
                open={this.props.open}
                onRequestClose={this.handleClose.bind(this)}>
                {
                    this.props.isLoading ?
                        <div className="notes-loading-container">
                            <CircularProgress />
                        </div>
                        :
                        <div>
                            <TextField
                                hintText="Title Field"
                                floatingLabelText="Title"
                                fullWidth={true}
                                errorText={this.state.titleEmpty ? 'This field is required' : null}
                                onChange={this.handleTitleChange.bind(this)}
                                value={this.state.note.title}/>
                            <TextField
                                hintText="Message Field"
                                floatingLabelText="Content"
                                multiLine={true}
                                fullWidth={true}
                                onChange={this.handleContentChange.bind(this)}
                                value={this.state.note.content}/>
                        </div>
                }
            </Dialog>
        );
    }
}


export default NoteModal;
