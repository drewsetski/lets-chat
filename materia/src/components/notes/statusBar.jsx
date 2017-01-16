import React from 'react';

import Toolbar from 'material-ui/lib/toolbar/toolbar';
import ToolbarGroup from 'material-ui/lib/toolbar/toolbar-group';
import ToolbarTitle from 'material-ui/lib/toolbar/toolbar-title';
import RaisedButton from 'material-ui/lib/raised-button';

class StatusBar extends React.Component {
    render() {
        return (
            <div>
                {
                    this.props.checkedConnection ?
                        <Toolbar>
                            <ToolbarGroup float="left">
                                <span className="notes-connection"><ToolbarTitle text="status:"/></span>
                                {
                                    this.props.isConnected ?
                                        <span className="notes-connection notes-connected">
                                    <ToolbarTitle text="connected"/>
                                </span>
                                        :
                                        <span className="notes-connection notes-disconnected">
                                    <ToolbarTitle text="disconnected"/>
                                </span>
                                }
                            </ToolbarGroup>
                            <ToolbarGroup float="right">
                                {
                                    !this.props.isConnected ?
                                        <RaisedButton
                                            linkButton={true}
                                            href="/notes/oauth"
                                            label="Connect"/>
                                        : null
                                }
                            </ToolbarGroup>
                        </Toolbar>
                        : null
                }
            </div>
        );
    }
}

export default StatusBar;
