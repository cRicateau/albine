import React, { Component, PropTypes } from 'react';
import { map } from 'lodash';

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sms: [],
      interval: null,
    };
  }

  componentDidMount() {
    this.startPoll();
  }

  request (url, options) {
    const requestOptions = {
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }
    }

    let status;
    return fetch(url, requestOptions)
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
    return this.request('api/sms?filter[order]=id%20DESC&filter[limit]=10')
    .then(result => {
      this.setState({
        sms: result.data,
      })
    });
  }

  startPoll () {
    this.setState({
      interval: setInterval(() => this.getSms(), 5000)
    })
  }

  render () {
    const messageList = this.state.sms;
    return (
      <div>
        <h1> Liste des messages </h1>
        {
          map(messageList, (message, index) => {
            return <div key={index}>{message.content}</div>
          })
        }
        <h2> Envoyez vos messages au 06 44 60 66 67 </h2>
      </div>
    )
  }
}

export default AppContainer
