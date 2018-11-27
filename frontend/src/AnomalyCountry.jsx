import React, {Component} from 'react';
import {connect} from 'react-redux';
import {asn_fetch, site_fetch, country_history_fetch} from './fetcher.js';
import {Nav, NavItem, NavLink} from 'reactstrap';
import {Button, ButtonGroup} from 'reactstrap';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import Countries from 'country-list';
import {Link} from 'react-router-dom';

class AnomalyCountryWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click_country = props.handle_click_country.bind(this);
        this.handle_click_year = props.handle_click_year.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);

        this.site_get_template = this.site_get_template.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    country_get_tab(country) {
        return (
            <NavItem key={country}>
                <NavLink
                    active={country === this.props.match.params.country}
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
                    (year === parseInt(this.props.match.params.year, 10) &&
                        'primary') ||
                    'secondary'
                }
                onClick={e => this.handle_click_year(e, year)}
            >
                {year}
            </Button>
        );
    }

    summary_get_table() {
        let data = Object.entries(
            (this.props.summary[this.props.match.params.year] || {})[
                this.props.match.params.country
            ] || {}
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
            (this.props.site[this.props.match.params.country] || {})[
                category.category_code
            ] || []
        ).reduce((current, site) => {
            let anomaly =
                ((this.props.chistory[this.props.match.params.year] || {})[
                    this.props.match.params.country
                ] || {})[site.url] || {};

            if (Object.keys(anomaly).length > 0) {
                current.push(
                    (
                        this.props.asn[this.props.match.params.country] || []
                    ).reduce(
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

    site_get_template(data_row, column) {
        return (
            <Link
                to={`/summary/${this.props.match.params.year}/${
                    this.props.match.params.country
                }/${data_row.site}`}
            >
                {data_row[column.field]}
            </Link>
        );
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
                            body={this.site_get_template}
                            key="site"
                            field="site"
                            header="Site URL"
                            style={{width: '350px'}}
                        />
                        {(
                            this.props.asn[this.props.match.params.country] ||
                            []
                        ).map(asn => (
                            <Column
                                key={asn}
                                field={asn}
                                header={asn}
                                style={{width: '100px'}}
                            />
                        ))}
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
                    Anomaly summary for{' '}
                    {Countries().getName(this.props.match.params.country)} in
                    year {this.props.match.params.year}
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
        chistory: state.history || {},
        country_list: state.country || [],
        site: state.site || {},
        category: state.category || {},
        asn: state.asn || {}
    }),
    dispatch => ({
        handle_click_country(e, country) {
            let [asn_date, site_date, history_date] = [
                new Date(),
                new Date(),
                new Date()
            ];

            e.preventDefault();

            this.props.delegate_loading_reset();

            this.props.delegate_loading_populate(asn_date);
            asn_fetch(
                dispatch,
                () => this.props.delegate_loading_done(asn_date),
                country
            );

            this.props.delegate_loading_populate(site_date);
            site_fetch(
                dispatch,
                () => this.props.delegate_loading_done(site_date),
                country
            );

            this.props.delegate_loading_populate(site_date);
            country_history_fetch(
                dispatch,
                () => this.props.delegate_loading_done(history_date),
                this.props.match.params.year,
                country
            );

            this.props.history.push(
                `/summary/${this.props.match.params.year}/${country}`
            );
        },

        handle_click_row(e) {
            this.props.history.push(
                `/summary/${this.props.match.params.year}/${
                    this.props.match.params.country
                }/${e.data.site}`
            );
        },

        handle_click_year(e, year) {
            let history_date = new Date();
            e.preventDefault();

            this.props.delegate_loading_reset();

            this.props.delegate_loading_populate(history_date);
            country_history_fetch(
                dispatch,
                () => this.props.delegate_loading_done(history_date),
                year,
                this.props.match.params.country
            );

            this.props.history.push(
                `/summary/${year}/${this.props.match.params.country}`
            );
        },

        handle_load() {
            let [asn_date, site_date, history_date] = [
                new Date(),
                new Date(),
                new Date()
            ];
            this.props.delegate_loading_reset();

            this.props.delegate_loading_populate(asn_date);
            asn_fetch(
                dispatch,
                () => this.props.delegate_loading_done(asn_date),
                this.props.match.params.country
            );

            this.props.delegate_loading_populate(site_date);
            site_fetch(
                dispatch,
                () => this.props.delegate_loading_done(site_date),
                this.props.match.params.country
            );

            this.props.delegate_loading_populate(history_date);
            country_history_fetch(
                dispatch,
                () => this.props.delegate_loading_done(history_date),
                this.props.match.params.year,
                this.props.match.params.country
            );
        }
    })
)(AnomalyCountryWidget);
