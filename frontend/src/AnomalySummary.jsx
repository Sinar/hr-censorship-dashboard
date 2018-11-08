import React, {Component} from 'react';
import {connect} from 'react-redux';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Nav, NavItem, NavLink} from 'reactstrap';
import {summary_fetch} from './fetcher.js';

export function make_anomaly_summary(year = 2018) {
    return {
        type: 'GO_ANOMALY_SUMMARY',
        query: {
            type: 'ANOMALY_SUMMARY',
            year: year
        }
    };
}

function make_anomaly_country(year, site) {
    return {
        type: 'GO_ANOMALY_COUNTRY',
        query: {
            type: 'ANOMALY_COUNTRY',
            year: year,
            site: site
        }
    };
}

class AnomalySummaryWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click = props.handle_click.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    link_get(country) {
        return (
            <NavItem>
                <NavLink onClick={e => this.handle_click(e, country)} href="#">
                    {country}
                </NavLink>
            </NavItem>
        );
    }

    summary_get_table() {
        return this.props.country_list.map(country =>
            Object.entries(this.props.category).reduce(
                (current, [code, _]) => {
                    current[code] = this.summary_get_category_count(
                        country,
                        code
                    );
                    return current;
                },
                {country: country}
            )
        );
    }

    summary_get_category_count(country, category) {
        return (
            ((this.props.summary[this.props.query.year] || {})[country] || {})[
                category
            ] || 0
        );
    }

    navbar_get_year(year) {
        return (
            <NavItem>
                {(year === this.props.query.year && (
                    <NavLink
                        href="#"
                        active
                        onClick={e => this.handle_click(e, year)}
                    >
                        {year}
                    </NavLink>
                )) || (
                    <NavLink href="#" onClick={e => this.handle_click(e, year)}>
                        {year}
                    </NavLink>
                )}
            </NavItem>
        );
    }

    render() {
        return (
            <div>
                <h2>Downtime summary for year {this.props.query.year}</h2>
                <Nav tabs>
                    {this.navbar_get_year(2018)}
                    {this.navbar_get_year(2017)}
                </Nav>
                <br />
                {Object.keys(this.props.summary[this.props.query.year] || {})
                    .length > 0 && (
                    <DataTable
                        value={this.summary_get_table()}
                        scrollable={true}
                        style={{width: '100%'}}
                        onRowClick={this.handle_click_row}
                    >
                        <Column
                            key="country"
                            field="country"
                            header="Country"
                            style={{width: '100px'}}
                        />
                        {Object.entries(this.props.category).map(
                            ([code, _]) => (
                                <Column
                                    key={code}
                                    field={code}
                                    header={code}
                                    style={{width: '75px'}}
                                />
                            )
                        )}
                    </DataTable>
                )}
            </div>
        );
    }
}

export default connect(
    state => ({
        country_list: state.country || [],
        category: state.category || {},
        summary: state.summary || {}
    }),
    dispatch => ({
        handle_click(e, year) {
            e.preventDefault();

            summary_fetch(dispatch, year);
            dispatch(make_anomaly_summary(year));
        },

        handle_click_row(e) {
            dispatch(
                make_anomaly_country(this.props.query.year, e.data.country)
            );
        },

        handle_load() {
            summary_fetch(dispatch, this.props.query.year);
        }
    })
)(AnomalySummaryWidget);
