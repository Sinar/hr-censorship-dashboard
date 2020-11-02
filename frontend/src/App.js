import "./App.css";

import {
  Alert,
  Button,
  Nav,
  NavItem,
  NavLink,
  Navbar,
  NavbarBrand,
} from "reactstrap";
import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { category_fetch, country_fetch, make_retry_done } from "./fetcher";

import AnomalyCountryContainer from "./AnomalyCountry";
import AnomalyCurrentContainer from "./AnomalyCurrent";
import AnomalyIncidentContainer from "./AnomalyIncident";
import AnomalySiteContainer from "./AnomalySite";
import AnomalySummaryContainer from "./AnomalySummary";
import { Container } from "reactstrap";
import { connect } from "react-redux";
import { withRouter } from "react-router";

function make_loading_populate(date) {
  return {
    type: "POPULATE_LOADING",
    date: date,
  };
}

function make_loading_done(date) {
  return {
    type: "LOADING_DONE",
    date: date,
  };
}

function make_loading_reset() {
  return { type: "LOADING_RESET" };
}

class AppWidget extends Component {
  constructor(props) {
    super(props);

    this.handle_load = props.handle_load.bind(this);
    this.handle_click_anomaly_current = props.handle_click_anomaly_current.bind(
      this
    );
    this.handle_click_anomaly_summary = props.handle_click_anomaly_summary.bind(
      this
    );
    this.handle_click_retry = props.handle_click_retry.bind(this);

    this.handle_loading_populate = props.handle_loading_populate.bind(this);
    this.handle_loading_done = props.handle_loading_done.bind(this);
    this.handle_loading_reset = props.handle_loading_reset.bind(this);
  }

  componentDidMount() {
    this.handle_load();
  }

  list_link_get(label, handler) {
    return (
      <NavItem>
        <NavLink tag="a" href="#" onClick={handler}>
          {label}
        </NavLink>
      </NavItem>
    );
  }

  panel_get() {
    return (
      <Switch>
        <Route
          path="/current/:country"
          render={(props) => (
            <AnomalyCurrentContainer
              {...props}
              delegate_loading_populate={this.handle_loading_populate}
              delegate_loading_done={this.handle_loading_done}
              delegate_loading_reset={this.handle_loading_reset}
            />
          )}
        />
        <Route
          path="/summary/:year/:country/:site(.+)"
          render={(props) => (
            <AnomalySiteContainer
              {...props}
              delegate_loading_populate={this.handle_loading_populate}
              delegate_loading_done={this.handle_loading_done}
              delegate_loading_reset={this.handle_loading_reset}
            />
          )}
        />
        <Route
          path="/summary/:year/:country"
          render={(props) => (
            <AnomalyCountryContainer
              {...props}
              delegate_loading_populate={this.handle_loading_populate}
              delegate_loading_done={this.handle_loading_done}
              delegate_loading_reset={this.handle_loading_reset}
            />
          )}
        />
        <Route
          path="/summary/:year"
          render={(props) => (
            <AnomalySummaryContainer
              {...props}
              delegate_loading_populate={this.handle_loading_populate}
              delegate_loading_done={this.handle_loading_done}
              delegate_loading_reset={this.handle_loading_reset}
            />
          )}
        />
        <Route
          path="/incident/:measurement_id"
          render={(props) => (
            <AnomalyIncidentContainer
              {...props}
              delegate_loading_populate={this.handle_loading_populate}
              delegate_loading_done={this.handle_loading_done}
              delegate_loading_reset={this.handle_loading_reset}
            />
          )}
        />
      </Switch>
    );
  }

  loading_get_alert() {
    return (
      <div>
        {this.props.loading.length > 0 && (
          <Alert color="info" key="loading">
            Page is fetching data, please wait.
          </Alert>
        )}
        {this.props.retry.map((item, key) => (
          <Alert color="danger" key={`error${key}`}>
            {item.message}{" "}
            <Button
              onClick={(e) =>
                this.handle_click_retry(e, item.date, item.callback)
              }
              bsstyle="primary"
            >
              Please try again
            </Button>
          </Alert>
        ))}
      </div>
    );
  }

  render() {
    return (
      <Container>
        <Navbar color="light" light expand="md">
          <NavbarBrand href="/">Censorship Dashboard</NavbarBrand>
          <Nav className="ml-auto" navbar>
            {this.list_link_get(
              "Current anomaly report",
              this.handle_click_anomaly_current
            )}
            {this.list_link_get(
              "Site anomaly summary",
              this.handle_click_anomaly_summary
            )}
          </Nav>
        </Navbar>
        {this.loading_get_alert()}
        {this.panel_get()}
      </Container>
    );
  }
}

export default withRouter(
  connect(
    (state) => ({
      loading: state.loading || [],
      retry: state.retry || [],
    }),
    (dispatch) => ({
      handle_click_anomaly_current(e) {
        e.preventDefault();

        this.props.history.push(`/current/my`);
      },

      handle_click_anomaly_summary(e) {
        e.preventDefault();

        this.props.history.push(`/summary/${new Date().getFullYear()}`);
      },

      handle_click_retry(e, timestamp, callback) {
        e.preventDefault();
        dispatch(make_retry_done(timestamp));
        callback();
      },

      handle_load() {
        category_fetch(
          dispatch,
          this.handle_loading_populate,
          this.handle_loading_done
        );

        country_fetch(
          dispatch,
          this.handle_loading_populate,
          this.handle_loading_done
        );

        if (this.props.location.pathname === "/") {
          this.props.history.push(`/summary/${new Date().getFullYear()}`);
        }
      },

      handle_loading_populate(date) {
        dispatch(make_loading_populate(date));
      },

      handle_loading_done(date) {
        dispatch(make_loading_done(date));
      },

      handle_loading_reset() {
        dispatch(make_loading_reset());
      },
    })
  )(AppWidget)
);
