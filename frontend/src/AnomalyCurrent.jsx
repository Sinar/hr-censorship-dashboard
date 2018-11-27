import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import {connect} from 'react-redux';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import Countries from 'country-list';
import {Link} from 'react-router-dom';

import {asn_fetch, anomaly_current_fetch, site_fetch} from './fetcher.js';

class AnomalyCurrentWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click = props.handle_click.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);

        this.site_get_template = this.site_get_template.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    link_get(country) {
        return (
            <NavItem key={country}>
                <NavLink
                    active={country === this.props.match.params.country}
                    onClick={e => this.handle_click(e, country)}
                    href="#"
                >
                    {country}
                </NavLink>
            </NavItem>
        );
    }

    category_get_sites(category) {
        return (
            (this.props.site[this.props.match.params.country] || {})[
                category.category_code
            ] || []
        ).reduce((current, site) => {
            let anomaly =
                (this.props.current[this.props.match.params.country] || {})[
                    site.url
                ] || {};

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
                                body={this.count_get_template}
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

    site_get_template(data_row, column) {
        return (
            <Link
                to={`/summary/${new Date().getFullYear()}/${
                    this.props.match.params.country
                }/${data_row.site}`}
            >
                {data_row[column.field]}
            </Link>
        );
    }

    count_get_template(data_row, column) {
        return (
            <span
                ref={ref => {
                    if (ref) {
                        ref.parentElement.classList.remove(
                            'text-white',
                            'bg-danger'
                        );

                        data_row[column.field] !== 0 &&
                            ref.parentElement.classList.add(
                                'text-white',
                                'bg-danger'
                            );
                    }
                }}
            >
                {data_row[column.field]}
            </span>
        );
    }

    render() {
        let summary = Object.entries(this.props.category).map(([_, category]) =>
            this.category_get_summary(category)
        );
        return (
            <div>
                <h2>
                    Current Inaccessible Sites for{' '}
                    {Countries().getName(this.props.match.params.country)}
                </h2>
                <Nav tabs>
                    {this.props.country_list.map(country =>
                        this.link_get(country)
                    )}
                </Nav>
                <br />

                {(summary.filter(x => x).length > 0 && summary) || (
                    <div>
                        <h3>Nothing to show</h3>
                        <p>All monitored sites are not blocked.</p>
                    </div>
                )}
            </div>
        );
    }
}

export default connect(
    state => ({
        current: state.current || [],
        country_list: state.country || [],
        category: state.category || {},
        asn: state.asn || [],
        site: state.site || {}
    }),
    dispatch => ({
        handle_click(e, country) {
            let [anomaly_date, asn_date, site_date] = [
                new Date(),
                new Date(),
                new Date()
            ];
            e.preventDefault();

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

            this.props.delegate_loading_populate(anomaly_date);
            anomaly_current_fetch(
                dispatch,
                () => this.props.delegate_loading_done(anomaly_date),
                country
            );

            this.props.history.push(`/current/${country}`);
        },

        handle_click_row(e) {
            this.props.history.push(
                `/summary/${new Date().getFullYear()}/${
                    this.props.match.params.country
                }/${e.data.site}`
            );
        },

        handle_load() {
            let [anomaly_date, asn_date, site_date] = [
                new Date(),
                new Date(),
                new Date()
            ];

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

            this.props.delegate_loading_populate(anomaly_date);
            anomaly_current_fetch(
                dispatch,
                () => this.props.delegate_loading_done(anomaly_date),
                this.props.match.params.country
            );
        }
    })
)(AnomalyCurrentWidget);
