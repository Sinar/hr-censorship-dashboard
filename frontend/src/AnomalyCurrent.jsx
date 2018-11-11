import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import {connect} from 'react-redux';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {make_anomaly_site} from './AnomalySite';
import Countries from 'country-list';

import {asn_fetch, anomaly_current_fetch, site_fetch} from './fetcher.js';

export function make_anomaly_current(country = 'my') {
    return {
        type: 'GO_ANOMALY_CURRENT',
        query: {
            type: 'ANOMALY_CURRENT',
            country: country
        }
    };
}

class AnomalyCurrentWidget extends Component {
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
            <NavItem key={country}>
                <NavLink
                    active={country === this.props.query.country}
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
            (this.props.site[this.props.query.country] || {})[
                category.category_code
            ] || []
        ).reduce((current, site) => {
            let anomaly =
                (this.props.current[this.props.query.country] || {})[
                    site.url
                ] || {};

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
        let summary = Object.entries(this.props.category).map(([_, category]) =>
            this.category_get_summary(category)
        );
        return (
            <div>
                <h2>
                    Current Inaccessible Sites for{' '}
                    {Countries().getName(this.props.query.country)}
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

            dispatch(make_anomaly_current(country));
        },

        handle_click_row(e) {
            dispatch(
                make_anomaly_site(
                    new Date().getFullYear(),
                    this.props.query.country,
                    e.data.site
                )
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
                this.props.query.country
            );

            this.props.delegate_loading_populate(site_date);
            site_fetch(
                dispatch,
                () => this.props.delegate_loading_done(site_date),
                this.props.query.country
            );

            this.props.delegate_loading_populate(anomaly_date);
            anomaly_current_fetch(
                dispatch,
                () => this.props.delegate_loading_done(anomaly_date),
                this.props.query.country
            );
        }
    })
)(AnomalyCurrentWidget);
