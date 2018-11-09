import React, {Component} from 'react';
import './App.css';
import {Container} from 'reactstrap';
import {Navbar, NavbarBrand, Nav, NavItem, NavLink} from 'reactstrap';
import {connect} from 'react-redux';
import AnomalyCurrentContainer from './AnomalyCurrent';
import {make_anomaly_current} from './AnomalyCurrent';
import AnomalySummaryContainer from './AnomalySummary';
import {make_anomaly_summary} from './AnomalySummary';
import AnomalyCountryContainer from './AnomalyCountry';
import AnomalySiteContainer from './AnomalySite';
import AnomalyIncidentContainer from './AnomalyIncident';
import {category_fetch, country_fetch} from './fetcher';

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
                result = <AnomalyCurrentContainer query={this.props.query} />;
                break;
            case 'ANOMALY_SUMMARY':
                result = <AnomalySummaryContainer query={this.props.query} />;
                break;
            case 'ANOMALY_COUNTRY':
                result = <AnomalyCountryContainer query={this.props.query} />;
                break;
            case 'ANOMALY_SITE':
                result = <AnomalySiteContainer query={this.props.query} />;
                break;
            case 'ANOMALY_INCIDENT':
                result = <AnomalyIncidentContainer query={this.props.query} />;
                break;
            default:
                break;
        }

        return result;
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
                {this.panel_get()}
            </Container>
        );
    }
}

export default connect(
    state => ({
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
            category_fetch(dispatch);
            country_fetch(dispatch);

            if (Object.keys(this.props.query).length === 0) {
                dispatch(make_anomaly_summary(2018));
            }
        }
    })
)(AppWidget);
