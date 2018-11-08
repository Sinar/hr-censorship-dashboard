import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import ReactDOM from 'react-dom';
import './index.css';
import AppContainer from './App';
import registerServiceWorker from './registerServiceWorker';
import dashboardApp from './dashboard';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

ReactDOM.render(
    <Provider store={createStore(dashboardApp)}>
        <AppContainer />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
