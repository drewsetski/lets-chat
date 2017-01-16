'use strict';

import {socket} from '../services/io';
import moment from 'moment';

export const EVERNOTE_CONNECTED = 'EVERNOTE_CONNECTED';
export const EVERNOTE_DISCONNECTED = 'EVERNOTE_DISCONNECTED';
export const EVERNOTE_ERROR = 'EVERNOTE_ERROR';
export const REQUEST_NOTES = 'REQUEST_NOTES';
export const RECEIVE_NOTES = 'RECEIVE_NOTES';
export const REQUEST_NOTE = 'REQUEST_NOTE';
export const RECEIVE_NOTE = 'RECEIVE_NOTE';

const CONTENT_FIRST_PART = '<!DOCTYPE en-note SYSTEM "http://xml.evernote.com/pub/enml2.dtd"><en-note>';
const CONTENT_LAST_PART = '</en-note>';

export const GET = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}
export const POST = {

    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        let error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}
function parseJSON(response) {
    return response.json();
}


export function evernoteConnected() {
    return {
        type: EVERNOTE_CONNECTED
    };
};

export function evernoteDisconnected() {
    return {
        type: EVERNOTE_DISCONNECTED
    }
}

export function evernoteError(error) {
    return {
        type: EVERNOTE_ERROR,
        errorMessage: error
    }
}

export function requestNotes() {
    return {
        type: REQUEST_NOTES
    };
};

export function receiveNotes(notes) {
    return {
        type: RECEIVE_NOTES,
        notes: notes
    };
};

export function fetchNotes() {
    return dispatch => {
        dispatch(requestNotes());
        return socket.emit('notes:list', function (response) {
            response.notes.map(function (note) {
                note.created = dateFormat(note.created);
                note.updated = dateFormat(note.updated);
            })
            dispatch(receiveNotes(response.notes));
        });
    };
};

function dateFormat(timestamp) {
    return moment(timestamp).format("MMMM Do YYYY, h:mm:ss a");
}

export function requestNote() {
    return {
        type: REQUEST_NOTE
    };
};

export function receiveNote(note) {
    return {
        type: RECEIVE_NOTE,
        selectedNote: note
    };
};

export function fetchNote(id) {
    return dispatch => {
        dispatch(requestNote());
        return socket.emit('notes:get', id, function (response) {
            let note = response.note;
            note.content = extractContent(note.content);
            dispatch(receiveNote(note));
        });
    }
}

export function createNote(note) {
    note.content = setContent(note.content);
    return dispatch => {
        return socket.emit('notes:add', note, function () {
            dispatch(fetchNotes());
        });
    }
}

export function updateNote(id, note) {
    note.content = setContent(note.content);
    return dispatch => {
        return socket.emit('notes:update', {id, note}, function () {
            dispatch(fetchNotes());
        });
    }
}

export function deleteNote(id) {
    return dispatch => {
        return socket.emit('notes:delete', id, function () {
            dispatch(fetchNotes());
        });
    }
}

function extractContent(data) {
    return data.match(new RegExp(CONTENT_FIRST_PART + "(.*)" + CONTENT_LAST_PART))[1];
}

function setContent(data) {
    let content = CONTENT_FIRST_PART;
    content += data;
    content += CONTENT_LAST_PART;
    return content
}
