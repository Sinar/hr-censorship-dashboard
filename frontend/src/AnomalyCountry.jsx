import React, {Component} from 'react';
import {connect} from 'react-redux';
import {asn_fetch, site_fetch, country_history_fetch} from './fetcher.js';
import {Nav, NavItem, NavLink} from 'reactstrap';
import {Button, ButtonGroup} from 'reactstrap';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {make_anomaly_site} from './AnomalySite';

export function make_anomaly_country(year, country) {
    return {
        type: 'GO_ANOMALY_COUNTRY',
        query: {
            type: 'ANOMALY_COUNTRY',
            year: year,
            country: country
        }
    };
}

class AnomalyCountryWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click_country = props.handle_click_country.bind(this);
        this.handle_click_year = props.handle_click_year.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    country_get_tab(country) {
        return (
            <NavItem key={country}>
                <NavLink
                    active={country === this.props.query.country}
                    onClick={e => this.handle_click_country(e, country)}
                >
                    {country}
                </NavLink>
            </NavItem>
        );
    }

    year_get_button(year) {
        return (
            <Button
                key={year}
                color={
                    (year === this.props.query.year && 'primary') || 'secondary'
                }
                onClick={e => this.handle_click_year(e, year)}
            >
                {year}
            </Button>
        );
    }

    summary_get_table() {
        let data = Object.entries(
            this.props.summary[this.props.query.year][this.props.query.country]
        ).map(([category_code, count]) => ({
            category: category_code,
            description: this.props.category[category_code]
                .category_description,
            count: count
        }));
        return (
            <DataTable value={data}>
                <Column
                    key="category"
                    field="category"
                    header="Category code"
                />
                <Column
                    key="description"
                    field="description"
                    header="Category description"
                />
                <Column key="count" field="count" header="Anomaly count" />
            </DataTable>
        );
    }

    category_get_sites(category) {
        return (
            (this.props.site[this.props.query.country] || {})[
                category.category_code
            ] || []
        ).reduce((current, site) => {
            let anomaly =
                ((this.props.history[this.props.query.year] || {})[
                    this.props.query.country
                ] || {})[site.url] || {};

            if (Object.keys(anomaly).length > 0) {
                current.push(
                    (this.props.asn[this.props.query.country] || []).reduce(
                        (current, asn) => {
                            current[asn] = (anomaly[asn] || []).length;
                            return current;
                        },
                        {site: site.url}
                    )
                );
            }

            return current;
        }, []);
    }

    category_get_summary(category) {
        let sites = this.category_get_sites(category);

        let result = null;

        if (sites.length > 0) {
            result = (
                <div key={category.category_code}>
                    <h3>{category.category_description}</h3>
                    <DataTable
                        value={sites}
                        scrollable={true}
                        style={{width: '100%'}}
                        onRowClick={this.handle_click_row}
                    >
                        <Column
                            key="site"
                            field="site"
                            header="Site URL"
                            style={{width: '350px'}}
                        />
                        {(this.props.asn[this.props.query.country] || []).map(
                            asn => (
                                <Column
                                    key={asn}
                                    field={asn}
                                    header={asn}
                                    style={{width: '100px'}}
                                />
                            )
                        )}
                    </DataTable>
                </div>
            );
        }

        return result;
    }

    render() {
        return (
            <div>
                <h2>
                    Anomaly summary for {this.props.query.country} in year{' '}
                    {this.props.query.year}
                </h2>

                <Nav tabs>
                    {this.props.country_list.map(country =>
                        this.country_get_tab(country)
                    )}
                </Nav>

                <br />

                <ButtonGroup>
                    {this.year_get_button(2018)}
                    {this.year_get_button(2017)}
                </ButtonGroup>

                <h3>Overview</h3>

                {this.summary_get_table()}

                {Object.entries(this.props.category).map(([_, category]) =>
                    this.category_get_summary(category)
                )}
            </div>
        );
    }
}

export default connect(
    state => ({
        summary: state.summary || {},
        history: state.history || {},
        country_list: state.country || [],
        site: state.site || {},
        category: state.category || {},
        asn: state.asn || {}
    }),
    dispatch => ({
        handle_click_country(e, country) {
            e.preventDefault();

            asn_fetch(dispatch, country);
            site_fetch(dispatch, country);
            country_history_fetch(dispatch, this.props.query.year, country);
            dispatch(make_anomaly_country(this.props.query.year, country));
        },

        handle_click_row(e) {
            dispatch(
                make_anomaly_site(
                    this.props.query.year,
                    this.props.query.country,
                    e.data.site
                )
            );
        },

        handle_click_year(e, year) {
            e.preventDefault();

            country_history_fetch(dispatch, year, this.props.query.country);
            dispatch(make_anomaly_country(year, this.props.query.country));
        },

        handle_load() {
            asn_fetch(dispatch, this.props.query.country);
            site_fetch(dispatch, this.props.query.country);
            country_history_fetch(
                dispatch,
                this.props.query.year,
                this.props.query.country
            );
        }
    })
)(AnomalyCountryWidget);
