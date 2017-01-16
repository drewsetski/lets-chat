import React from 'react';
import {Link} from 'react-router';

import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import ActionDelete from 'material-ui/lib/svg-icons/action/delete';
import IconButton from 'material-ui/lib/icon-button';

class NotesList extends React.Component {

    handleDelete(id, e) {
        e.stopPropagation();
        e.preventDefault();
        this.props.onDeleteNote(id);
    }

    render() {
        return (
            <List className="notes-list">
                {this.props.items.map((item, key) => (
                    <Link
                        key={key}
                        to={`/m/notes/${item.guid}`}
                        className="note-link">
                        <ListItem
                            primaryText={item.title}
                            secondaryText={item.updated}
                            rightIconButton={
                                <IconButton
                                    touch={true}
                                    onClick={(e) => this.handleDelete(item.guid, e)}>
                                    <ActionDelete color="#F44336"/>
                                </IconButton>
                            }>
                        </ListItem>
                    </Link>
                ))}
            </List>
        );
    }
}


export default NotesList;
