'use strict';

import {combineReducers} from 'redux';

import update from 'react-addons-update';

import {routerReducer as routing} from 'react-router-redux';

import {
    CLIENT_CONNECTED,
    CLIENT_DISCONNECTED,
    CLIENT_ERROR,
    REQUEST_WHO_AM_I,
    RECEIVE_WHO_AM_I,
    REQUEST_ROOMS,
    RECEIVE_ROOMS,
    REQUEST_CONVERSATION,
    RECEIVE_CONVERSATION,
    REQUEST_CONVERSATION_MESSAGES,
    RECEIVE_CONVERSATION_MESSAGES,
    ATTEMPT_CONVERSATION_MESSAGE,
    CONFIRM_CONVERSATION_MESSAGE,
    RECEIVE_CONVERSATION_MESSAGE,
    EVERNOTE_CONNECTED,
    EVERNOTE_DISCONNECTED,
    EVERNOTE_ERROR,
    REQUEST_NOTES,
    RECEIVE_NOTES,
    REQUEST_NOTE,
    RECEIVE_NOTE,
} from '../actions';

function connection(state = {
    isAuthenticated: true,
    isConnected: false
}, action) {
    switch (action.type) {
        case CLIENT_CONNECTED:
            return Object.assign({}, state, {
                isConnected: true,
                isAuthenticated: true
            });
        case CLIENT_DISCONNECTED:
            return Object.assign({}, state, {
                isConnected: false
            });
        case CLIENT_ERROR:
            const isAuthenticated = !/not authorized/i.test(action.error);
            return Object.assign({}, state, {
                isAuthenticated
            });
        default:
            return state;
    }
    ;
};

function user(state = {
    isFetching: true,
    profile: {}
}, action) {
    switch (action.type) {
        case REQUEST_WHO_AM_I:
            return Object.assign({}, state, {
                isFetching: true
            });
        case RECEIVE_WHO_AM_I:
            return Object.assign({}, state, {
                isFetching: false,
                profile: Object.assign({}, action.user)
            });
        default:
            return state;
    }
    ;
};

function rooms(state = {
    isFetching: true,
    items: []
}, action) {
    switch (action.type) {
        case REQUEST_ROOMS:
            return Object.assign({}, state, {
                isFetching: true
            });
        case RECEIVE_ROOMS:
            return Object.assign({}, state, {
                isFetching: false,
                items: action.rooms
            });
        default:
            return state;
    }
};

function conversation(state = {
    isFetching: false,
    isFetchingMessages: false,
    isSendingMessages: false,
    isJoined: false,
    messages: []
}, action) {
    switch (action.type) {
        case REQUEST_CONVERSATION:
            return Object.assign({}, state, {
                id: action.id,
                isFetching: true
            });
        case RECEIVE_CONVERSATION:
            return Object.assign({}, state, action.conversation, {
                id: action.id,
                isFetching: false,
                isJoined: true
            });
        case REQUEST_CONVERSATION_MESSAGES:
            return Object.assign({}, state, {
                isFetchingMessages: true
            });
        case RECEIVE_CONVERSATION_MESSAGES:
            if (state.messages.length > 0) {
                return Object.assign({}, state, {
                    isFetchingMessages: false
                });
            }
            return update(state, {
                isFetchingMessages: {
                    $set: false
                },
                messages: {
                    $merge: action.messages.reverse()
                }
            });
        case ATTEMPT_CONVERSATION_MESSAGE:
            return Object.assign({}, state, {
                isSendingMessage: true
            });
        case CONFIRM_CONVERSATION_MESSAGE:
            return Object.assign({}, state, {
                isSendingMessage: false
            });
        case RECEIVE_CONVERSATION_MESSAGE:
            return update(state, {
                messages: {
                    $push: [action.message]
                }
            });
        default:
            return state;
    }
};

function conversations(state = {
    items: []
}, action) {
    switch (action.type) {
        case REQUEST_CONVERSATION:
        case RECEIVE_CONVERSATION:
        case REQUEST_CONVERSATION_MESSAGES:
        case RECEIVE_CONVERSATION_MESSAGES:
        case ATTEMPT_CONVERSATION_MESSAGE:
        case CONFIRM_CONVERSATION_MESSAGE:
        case RECEIVE_CONVERSATION_MESSAGE:
            const index = _.findIndex(state.items, {
                id: action.id
            });
            if (index > -1) {
                return update(state, {
                    items: {
                        [index]: {
                            $merge: conversation(state.items[index], action)
                        }
                    }
                });
            }
            return update(state, {
                items: {
                    $push: [conversation(undefined, action)]
                }
            });
        default:
            return state;
    }
};
function notes(state = {
    isFetching: false,
    noteIsFetching: false,
    checkedConnection: false,
    isConnected: false,
    hasError: false,
    errorMessage: null,
    notes: [],
    selectedNote: {}
}, action) {
    switch (action.type) {
        case EVERNOTE_CONNECTED:
            return Object.assign({}, state, {
                isConnected: true,
                checkedConnection: true,
                hasError: false,
                errorMessage: null
            });
        case EVERNOTE_DISCONNECTED:
            return Object.assign({}, state, {
                isConnected: false,
                checkedConnection: true,
                hasError: false,
                errorMessage: null
            });
        case EVERNOTE_ERROR:
            return Object.assign({}, state, {
                hasError: true,
                errorMessage: action.errorMessage
            });
        case REQUEST_NOTES:
            return Object.assign({}, state, {
                isFetching: true
            });
        case RECEIVE_NOTES:
            return Object.assign({}, state, {
                isFetching: false,
                notes: action.notes
            });
        case REQUEST_NOTE:
            return Object.assign({}, state, {
                noteIsFetching: true,
                selectedNote: {}
            });
        case RECEIVE_NOTE:
            return Object.assign({}, state, {
                noteIsFetching: false,
                selectedNote: action.selectedNote
            });
        default:
            return state;
    }
};

export default combineReducers(Object.assign({}, {
    routing,
    connection,
    user,
    rooms,
    conversations,
    notes
}));
