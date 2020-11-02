import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

import AppContainer from "./App";
import { HashRouter } from "react-router-dom";
import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";
import { createStore } from "redux";
import dashboardApp from "./dashboard";
import registerServiceWorker from "./registerServiceWorker";

ReactDOM.render(
  <Provider store={createStore(dashboardApp)}>
    <HashRouter>
      <AppContainer />
    </HashRouter>
  </Provider>,
  document.getElementById("root")
);
registerServiceWorker();
