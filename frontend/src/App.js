import React, {Component} from 'react';
import './App.css';
import {Container} from 'reactstrap';
import {Alert, Navbar, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import {connect} from 'react-redux';
import AnomalyCurrentContainer from './AnomalyCurrent';
import {make_anomaly_current} from './AnomalyCurrent';
import AnomalySummaryContainer from './AnomalySummary';
import {make_anomaly_summary} from './AnomalySummary';
import AnomalyCountryContainer from './AnomalyCountry';
import AnomalySiteContainer from './AnomalySite';
import AnomalyIncidentContainer from './AnomalyIncident';
import {category_fetch, country_fetch} from './fetcher';

function make_loading_populate(date) {
    return {
        type: 'POPULATE_LOADING',
        date: date
    };
}

function make_loading_done(date) {
    return {
        type: 'LOADING_DONE',
        date: date
    };
}

function make_loading_reset() {
    return {type: 'LOADING_RESET'};
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

        this.handle_loading_populate = props.handle_loading_populate.bind(this);
        this.handle_loading_done = props.handle_loading_done.bind(this);
        this.handle_loading_reset = props.handle_loading_reset.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    list_link_get(label, type, handler) {
        return (
            <NavItem>
                <NavLink
                    disabled={this.props.query.type === type}
                    tag="a"
                    href="#"
                    onClick={handler}
                >
                    {label}
                </NavLink>
            </NavItem>
        );
    }

    panel_get() {
        let result = null;
        switch (this.props.query.type) {
            case 'ANOMALY_CURRENT':
                result = (
                    <AnomalyCurrentContainer
                        delegate_loading_populate={this.handle_loading_populate}
                        delegate_loading_done={this.handle_loading_done}
                        delegate_loading_reset={this.handle_loading_reset}
                        query={this.props.query}
                    />
                );
                break;
            case 'ANOMALY_SUMMARY':
                result = (
                    <AnomalySummaryContainer
                        delegate_loading_populate={this.handle_loading_populate}
                        delegate_loading_done={this.handle_loading_done}
                        delegate_loading_reset={this.handle_loading_reset}
                        query={this.props.query}
                    />
                );
                break;
            case 'ANOMALY_COUNTRY':
                result = (
                    <AnomalyCountryContainer
                        delegate_loading_populate={this.handle_loading_populate}
                        delegate_loading_done={this.handle_loading_done}
                        delegate_loading_reset={this.handle_loading_reset}
                        query={this.props.query}
                    />
                );
                break;
            case 'ANOMALY_SITE':
                result = (
                    <AnomalySiteContainer
                        delegate_loading_populate={this.handle_loading_populate}
                        delegate_loading_done={this.handle_loading_done}
                        delegate_loading_reset={this.handle_loading_reset}
                        query={this.props.query}
                    />
                );
                break;
            case 'ANOMALY_INCIDENT':
                result = (
                    <AnomalyIncidentContainer
                        delegate_loading_populate={this.handle_loading_populate}
                        delegate_loading_done={this.handle_loading_done}
                        delegate_loading_reset={this.handle_loading_reset}
                        query={this.props.query}
                    />
                );
                break;
            default:
                break;
        }

        return result;
    }

    loading_get_alert() {
        if (this.props.loading.length > 0) {
            return (
                <Alert color="info">Page is fetching data, please wait.</Alert>
            );
        }
    }

    render() {
        return (
            <Container>
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/">Censorship Board</NavbarBrand>
                    <Nav className="ml-auto" navbar>
                        {this.list_link_get(
                            'Current anomaly report',
                            'ANOMALY_CURRENT',
                            this.handle_click_anomaly_current
                        )}
                        {this.list_link_get(
                            'Site anomaly summary',
                            'ANOMALY_SUMMARY',
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

export default connect(
    state => ({
        loading: state.loading || [],
        query: state.query || {},
        category: state.category || []
    }),
    dispatch => ({
        handle_click_anomaly_current(e) {
            e.preventDefault();

            dispatch(make_anomaly_current());
        },

        handle_click_anomaly_summary(e) {
            e.preventDefault();

            dispatch(make_anomaly_summary());
        },

        handle_load() {
            let [category_date, country_date] = [new Date(), new Date()];

            this.handle_loading_populate(category_date);
            this.handle_loading_populate(country_date);

            category_fetch(dispatch, () => {
                this.handle_loading_done(category_date);

                country_fetch(dispatch, () => {
                    this.handle_loading_done(country_date);

                    if (Object.keys(this.props.query).length === 0) {
                        dispatch(make_anomaly_summary(2018));
                    }
                });
            });
        },

        handle_loading_populate(date) {
            dispatch(make_loading_populate(date));
        },

        handle_loading_done(date) {
            dispatch(make_loading_done(date));
        },

        handle_loading_reset() {
            dispatch(make_loading_reset());
        }
    })
)(AppWidget);
