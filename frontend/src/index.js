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
import { configureStore } from "@reduxjs/toolkit";
import registerServiceWorker from "./registerServiceWorker";
import { rootReducer } from "./reducers";

var store = configureStore({
  reducer: rootReducer,
});

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <HashRouter>
        <AppContainer />
      </HashRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
registerServiceWorker();
