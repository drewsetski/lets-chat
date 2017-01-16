//
// Evernote Controller
//

'use strict';
var _ = require('lodash'),
    settings = require('./../config'),
    Evernote = require('evernote');

const callbackUrl = 'http://localhost:5000/notes/oauth/callback';

module.exports = function () {
    var app = this.app,
        core = this.core,
        middlewares = this.middlewares,
        models = this.models,
        User = models.user;

    app.route('/notes')
        .all(middlewares.requireLogin)
        .get(function (req) {
            req.io.route('notes:list');
        });

    app.route('/notes/oauth')
        .get(function (req, res) {
            var client = new Evernote.Client({
                consumerKey: settings.evernote.apiKey,
                consumerSecret: settings.evernote.apiSecret,
                sandbox: settings.evernote.sandbox,
                china: settings.evernote.china
            });

            client.getRequestToken(callbackUrl, function (error, oauthToken, oauthTokenSecret, results) {
                if (error) {
                    req.session.error = JSON.stringify(error);
                    res.redirect('/m/notes');
                } else {
                    // store the tokens in the session
                    req.session.evernoteOauthToken = oauthToken;
                    req.session.evernoteOauthTokenSecret = oauthTokenSecret;

                    // redirect the user to authorize the token
                    res.redirect(client.getAuthorizeUrl(oauthToken));
                }
            });
        });

    app.route('/notes/oauth/callback')
        .get(function (req, res) {
            var client = new Evernote.Client({
                consumerKey: settings.evernote.apiKey,
                consumerSecret: settings.evernote.apiSecret,
                sandbox: settings.evernote.sandbox,
                china: settings.evernote.china
            });

            client.getAccessToken(
                req.session.evernoteOauthToken,
                req.session.evernoteOauthTokenSecret,
                req.query.oauth_verifier,
                function (error, oauthAccessToken, oauthAccessTokenSecret, results) {
                    if (error) {
                        console.log(error);
                        app.io.emit('notes:error', error);
                        res.redirect('/m/notes');
                    } else {
                        req.session.oauthAccessToken = oauthAccessToken;
                        req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
                        req.session.edamShard = results.edam_shard;
                        req.session.edamUserId = results.edam_userId;
                        req.session.edamExpires = results.edam_expires;
                        req.session.edamNoteStoreUrl = results.edam_noteStoreUrl;
                        req.session.edamWebApiUrlPrefix = results.edam_webApiUrlPrefix;
                        app.io.emit('notes:connect');
                        res.redirect('/m/notes');
                    }
                });
        });

    app.route('/notes/:note')
        .all(middlewares.requireLogin)
        .get(function (req) {
            req.io.route('notes:get');
        })
        .post(function (req) {
            req.io.route('notes:add');
        })
        .put(function (req) {
            req.io.route('notes:update');
        })
        .delete(function (req) {
            req.io.route('notes:delete');
        });

    app.io.route('notes', {
        list: function (req, res) {
            if (req.session.oauthAccessToken) {
                app.io.emit('notes:connect');
                var token = req.session.oauthAccessToken;
                var client = new Evernote.Client({
                    token: token,
                    sandbox: settings.evernote.sandbox,
                    china: settings.evernote.china
                });
                var noteStore = client.getNoteStore();
                noteStore.listNotebooks().then(
                    (notebooks) => {
                        if (notebooks.length) {
                            var resultSpec = new Evernote.NoteStore.NotesMetadataResultSpec({
                                includeTitle: true,
                                includeContentLength: true,
                                includeCreated: true,
                                includeUpdated: true,
                                includeDeleted: true,
                                includeUpdateSequenceNum: true,
                                includeNotebookGuid: true,
                                includeTagGuids: true,
                                includeAttributes: true,
                                includeLargestResourceMime: true,
                                includeLargestResourceSize: true
                            });
                            // notebooks.map(function (notebook) {
                            var filter = new Evernote.NoteStore.NoteFilter();
                            noteStore.findNotesMetadata(filter, 0, 100, resultSpec).then(
                                (response) => {
                                    res.json({notes: response.notes});
                                },
                                (error) => {
                                    console.log(error);
                                }
                            );
                            // });
                        }
                    },
                    (error) => {
                        return res.status(400).json(error);
                    });
            } else {
                app.io.emit('notes:disconnect');
            }
        },
        get: function (req, res) {
            let guid = req.data;
            if (req.session.oauthAccessToken) {
                var token = req.session.oauthAccessToken;
                var client = new Evernote.Client({
                    token: token,
                    sandbox: settings.evernote.sandbox,
                    china: settings.evernote.china
                });
                var noteStore = client.getNoteStore();
                var resultSpec = new Evernote.NoteStore.NotesMetadataResultSpec({
                    includeContent: true,
                    includeResourcesData: true,
                    includeResourcesRecognition: true,
                    includeResourcesAlternateData: true,
                    includeSharedNotes: true,
                    includeNoteAppDataValues: true,
                    includeResourceAppDataValues: true,
                    includeAccountLimits: true
                });
                noteStore.getNoteWithResultSpec(guid, resultSpec).then(
                    (note) => {
                        res.json({note: note});
                    },
                    (error) => {
                        console.log(error);
                        return res.status(400).json(error);
                    });
            } else {
                app.io.emit('notes:disconnect');
            }
        },
        add: function (req, res) {
            let noteData = req.data;
            if (req.session.oauthAccessToken) {
                var token = req.session.oauthAccessToken;
                var client = new Evernote.Client({
                    token: token,
                    sandbox: settings.evernote.sandbox,
                    china: settings.evernote.china
                });
                var note = new Evernote.Types.Note({
                   title: noteData.title,
                   content: noteData.content
                });
                var noteStore = client.getNoteStore();
                noteStore.createNote(note).then(
                    (response) => {
                        app.io.emit('notes:list');
                        return res.status(200).json({'message': 'created'});
                    },
                    (error) => {
                        console.log(error);
                        return res.status(400).json(error);
                    });
            } else {
                app.io.emit('notes:disconnect');
            }
        },
        update: function (req, res) {
            let guid = req.data.id;
            let note = req.data.note;
            if (req.session.oauthAccessToken) {
                var token = req.session.oauthAccessToken;
                var client = new Evernote.Client({
                    token: token,
                    sandbox: settings.evernote.sandbox,
                    china: settings.evernote.china
                });
                var noteStore = client.getNoteStore();
                noteStore.updateNote(note).then(
                    (response) => {
                        app.io.emit('notes:list');
                        return res.status(200).json({'message': 'updated'});
                    },
                    (error) => {
                        console.log(error);
                        return res.status(400).json(error);
                    });
            } else {
                app.io.emit('notes:disconnect');
            }
        },
        delete: function (req, res) {
            let guid = req.data;
            if (req.session.oauthAccessToken) {
                var token = req.session.oauthAccessToken;
                var client = new Evernote.Client({
                    token: token,
                    sandbox: settings.evernote.sandbox,
                    china: settings.evernote.china
                });
                var noteStore = client.getNoteStore();
                noteStore.deleteNote(guid).then(
                    (response) => {
                        return res.status(200).json({'message': 'deleted'});
                        app.io.emit('notes:list');
                    },
                    (error) => {
                        console.log(error);
                        return res.status(400).json(error);
                    });
            } else {
                app.io.emit('notes:disconnect');
            }
        }
    });
}
