import React, { Component, PropTypes } from 'react';
import { map } from 'lodash';
import { List, ListItem } from 'material-ui/List';
import UserIcon from 'material-ui/svg-icons/notification/sms';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import moment from 'moment-timezone';
import Divider from 'material-ui/Divider';
import {pink400, pink200} from 'material-ui/styles/colors';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: pink400,
  },
});

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        tweets: [
          { content: 'salut voici un message'},
          { content: 'salut voici un message'},
        ]
      },
      interval: null,
    };
  }

  componentDidMount() {
    this.startPoll();
  }

  request (url) {
    let baseApiPath = '';
    let options = {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    };

    if (process.env.NODE_ENV === 'development') {
      baseApiPath = 'http://10.0.0.10';
      options.credentials = 'include'; // needed for CORS requests
    }

    let status;
    return fetch(`${baseApiPath}/${url}`, options)
    .then((response) => {
      status = response.status;
      return response.json();
    })
    .then((response) => {
      const result = {
        status,
        data: response,
      };
      if (status >= 200 && status < 300) {
        return result;
      }
      const err = new Error(response.error ? response.error.name : JSON.stringify(response));
      err.data = response;
      throw err;
    });
  };

  getSms () {
    return this.request('api/sms/display')
    .then(result => {
      this.setState({
        data: result.data,
      })
    });
  }

  startPoll () {
    this.setState({
      interval: setInterval(() => this.getSms(), 5000)
    })
  }

  render () {
    const messageList = this.state.data.tweets;
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <AppBar
            title="Envoyez vos messages par SMS au 06 44 60 66 67"
            showMenuIconButton={false}
          />
          <List>
          {
            map(messageList, (message, index) => {
              return <div>
              <ListItem
                key={index}
                leftAvatar={<UserIcon style={{ width: '40px', height: '40px', color: pink200 }}/>}
                primaryText={`${moment.tz(message.createdat, 'Europe/Paris').format('H:mm')}: ${message.content}`}
              />
                <Divider inset={true} />
              </div>
            })
          }
          </List>
        </div>
      </MuiThemeProvider>
    )
  }
}

export default AppContainer
