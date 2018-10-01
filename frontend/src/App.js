import React, {Component} from 'react';
import './App.css';
import {Row, Col} from 'reactstrap';
import {Container} from 'reactstrap';
import {ListGroup, ListGroupItem} from 'reactstrap';
import {connect} from 'react-redux';
import CurrentInaccessibleContainer from './CurrentInaccessible';
import DowntimeSummaryContainer from './DowntimeSummary';

function make_populate_data(data) {
    return {
        type: 'POPULATE_DATA',
        data: data
    };
}

function make_current_inaccessible(country = 'my') {
    return {
        type: 'GO_CURRENT_INACCESSIBLE',
        param: {
            type: 'CURRENT_INACCESSIBLE',
            country: country
        }
    };
}

function make_monitored_list(country = 'my') {
    return {
        type: 'GO_MONITORED_LIST',
        param: {
            type: 'MONITORED_LIST',
            country: country
        }
    };
}

function make_downtime_history(country, site, date) {
    return {
        type: 'GO_DOWNTIME_HISTORY',
        param: {
            type: 'DOWNTIME_HISTORY',
            country: country,
            site: site,
            date: date
        }
    };
}

function make_downtime_summary(country = 'my', period = 'year') {
    return {
        type: 'GO_DOWNTIME_SUMMARY',
        param: {
            type: 'DOWNTIME_SUMMARY',
            country: country,
            period: period
        }
    };
}

class AppWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_click_current_inaccessible = props.handle_click_current_inaccessible.bind(
            this
        );
        this.handle_click_monitored_list = props.handle_click_monitored_list.bind(
            this
        );
        this.handle_click_downtime_summary = props.handle_click_downtime_summary.bind(
            this
        );
        this.handle_click_downtime_history = props.handle_click_downtime_history.bind(
            this
        );
    }

    list_link_get(label, type, handler) {
        return (
            <ListGroupItem
                disabled={this.props.current.type === type}
                tag="a"
                href="#"
                onClick={handler}
            >
                {label}
            </ListGroupItem>
        );
    }

    panel_get() {
        let result;
        switch (this.props.current.type) {
            case 'CURRENT_INACCESSIBLE':
                result = (
                    <CurrentInaccessibleContainer
                        country={this.props.current.country}
                        delegate_populate={this.props.handle_populate.bind(
                            this
                        )}
                        delegate_navigate={this.props.handle_navigate.bind(
                            this,
                            make_current_inaccessible
                        )}
                    />
                );
                break;
            case 'DOWNTIME_SUMMARY':
                result = (
                    <DowntimeSummaryContainer
                        country={this.props.current.country}
                        delegate_populate={this.props.handle_populate.bind(
                            this
                        )}
                        delegate_navigate={this.props.handle_navigate.bind(
                            this,
                            make_downtime_summary
                        )}
                    />
                );
                break;
        }

        return result;
    }

    render() {
        return (
            <Row>
                <Col md="3">
                    <Container>
                        <h1>Censorship Board</h1>
                        <div
                            style={{
                                width: '200px',
                                height: '200px',
                                backgroundColor: '#0099FF',
                                margin: '0 auto'
                            }}
                        >
                            &nbsp;
                        </div>
                    </Container>
                    <ListGroup flush>
                        {this.list_link_get(
                            'Current inaccesible sites',
                            'CURRENT_INACCESSIBLE',
                            this.handle_click_current_inaccessible
                        )}
                        {/*this.list_link_get(
                            'List of monitored sites',
                            'MONITORED_LIST',
                            this.handle_click_monitored_list
                        )*/}
                        {this.list_link_get(
                            'Site downtime summary',
                            'DOWNTIME_SUMMARY',
                            this.handle_click_downtime_summary
                        )}
                        {/*
                        {this.list_link_get(
                            'Site downtime history',
                            'DOWNTIME_HISTORY',
                            this.handle_click_downtime_summary
                        )}
                        */}
                    </ListGroup>
                </Col>
                <Col md="9">{this.panel_get()}</Col>
            </Row>
        );
    }
}

export default connect(
    state => ({
        current: state.current
    }),
    dispatch => ({
        handle_click_current_inaccessible(e) {
            e.preventDefault();

            this.props.handle_navigate.call(this, make_current_inaccessible);
        },

        handle_click_monitored_list(e) {
            e.preventDefault();

            this.props.handle_navigate.call(this, make_monitored_list);
        },

        handle_click_downtime_history(e) {
            e.preventDefault();

            this.props.handle_navigate.call(this, make_downtime_history);
        },

        handle_click_downtime_summary(e) {
            e.preventDefault();

            this.props.handle_navigate.call(this, make_downtime_summary);
        },

        handle_navigate(action, params = []) {
            dispatch(action.apply(this, params));
        },

        handle_populate(data) {
            dispatch(make_populate_data(data));
        }
    })
)(AppWidget);
