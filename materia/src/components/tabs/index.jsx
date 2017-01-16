'use strict';

import React from 'react';

import {Link} from 'react-router';

import IconButton from 'material-ui/lib/icon-button';

import HomeIcon from 'react-material-icons/icons/navigation/apps';

import Tab from './tab';

export default React.createClass({
    render() {
        var pathNotes = false;
        if (this.props.route['path']) {
            pathNotes = this.props.route['path'].startsWith("notes")
        }
        return (
            <div className="lcb-tabs">
                <Tab
                    className={pathNotes && 'selected'}
                    label="Notes"
                    url="/m/notes"/>
                <Link to="/m">
                    <IconButton>
                        <HomeIcon color="#fff"/>
                    </IconButton>
                </Link>
                {this.props.conversations.map((conversation) => {
                    return (
                        <Tab
                            className={this.props.selected === conversation.id && 'selected'}
                            key={conversation.id}
                            label={conversation.name}
                            url={`/m/room/${conversation.id}`}/>
                    );
                })}
            </div>
        )
    }
});
