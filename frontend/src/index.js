import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
    <Provider store={createStore(() => {})}>
        <App />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
