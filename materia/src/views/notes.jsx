import React from 'react';
import {connect} from 'react-redux';
import {socket} from '../services/io';

import StatusBar from '../components/notes/statusBar';
import NotesList from '../components/notes/notesList';
import NoteModal from '../components/notes/noteModal';

import CircularProgress from 'material-ui/lib/circular-progress';
import ContentAdd from 'material-ui/lib/svg-icons/content/add';
import FloatingActionButton from 'material-ui/lib/floating-action-button';

import {
    fetchNotes,
    evernoteConnected,
    evernoteDisconnected,
    evernoteError,
    fetchNote,
    updateNote,
    deleteNote,
    createNote
} from '../actions';

class Notes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            openNoteModal: false
        };
    }

    componentWillMount() {

        const {dispatch} = this.props;

        socket.on('notes:connect', function () {
            dispatch(evernoteConnected());
        });

        socket.on('notes:disconnect', function () {
            dispatch(evernoteDisconnected());
        });

        socket.on('notes:error', function (error) {
            dispatch(evernoteError(error));
        });

        socket.on('notes:list', function (error) {
            dispatch(fetchNotes());
        });

        dispatch(fetchNotes());
    }

    componentDidMount() {
        if (this.props.params.id) {
            this.setState({
                openNoteModal: true
            });
            this.props.dispatch(fetchNote(this.props.params.id));
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.params.id) {
            this.setState({
                openNoteModal: false
            });
        }
        if (this.props.params.id === nextProps.params.id) {
            return;
        }
        if (nextProps.params.id) {
            this.setState({
                openNoteModal: true
            });
            nextProps.dispatch(fetchNote(nextProps.params.id));
        }
    }

    onNoteModalClose() {
        this.setState({
            openNoteModal: false
        });
        this.props.history.push('/m/notes');
    }

    onSaveNote(note) {
        if (note.guid) {
            this.props.dispatch(updateNote(note.guid, note));
        } else {
            this.props.dispatch(createNote(note));
        }

        this.onNoteModalClose();
    }

    onDeleteNote(id) {
        this.props.dispatch(deleteNote(id));
    }

    onOpenCreateModal() {
        this.setState({
            openNoteModal: true
        });
    }

    render() {
        return (
            <div className="notes-container">
                <StatusBar
                    checkedConnection={this.props.checkedConnection}
                    isConnected={this.props.isConnected}/>
                {
                    this.props.isConnected ?
                        <div>
                            {
                                this.props.notes.length ?
                                    <NotesList
                                        params={this.props.params}
                                        items={this.props.notes}
                                        onDeleteNote={this.onDeleteNote.bind(this)}/>
                                    : null
                            }
                            {
                                this.props.isFetching ?
                                    <div className="notes-loading-container">
                                        <CircularProgress />
                                    </div>
                                    : null

                            }
                        </div>
                        : null
                }
                <NoteModal
                    note={this.props.selectedNote}
                    open={this.state.openNoteModal}
                    isLoading={this.props.noteIsFetching}
                    onNoteModalClose={this.onNoteModalClose.bind(this)}
                    onSaveNote={this.onSaveNote.bind(this)}/>
                <FloatingActionButton
                    className="note-add-button"
                    secondary={true}
                    onClick={this.onOpenCreateModal.bind(this)}>
                    <ContentAdd />
                </FloatingActionButton>

            </div>
        )
    }
}

function mapStateToProps(state, props) {
    return {
        isFetching: state.notes.isFetching,
        noteIsFetching: state.notes.noteIsFetching,
        checkedConnection: state.notes.checkedConnection,
        isConnected: state.notes.isConnected,
        notes: state.notes.notes,
        selectedNote: state.notes.selectedNote
    }
};

export default connect(mapStateToProps)(Notes);
