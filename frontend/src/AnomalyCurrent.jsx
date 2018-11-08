import React, {Component} from 'react';
import {Nav, NavItem, NavLink} from 'reactstrap';
import {connect} from 'react-redux';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';

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
    }

    componentDidMount() {
        this.handle_load();
    }

    link_get(country) {
        return (
            <NavItem key={country}>
                {(country === this.props.query.country && (
                    <NavLink
                        active
                        onClick={e => this.handle_click(e, country)}
                        href="#"
                    >
                        {country}
                    </NavLink>
                )) || (
                    <NavLink
                        onClick={e => this.handle_click(e, country)}
                        href="#"
                    >
                        {country}
                    </NavLink>
                )}
            </NavItem>
        );
    }

    summary_get_category(category) {
        let sites = (
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

        let result = null;

        if (sites.length > 0) {
            result = (
                <div>
                    <h3>{category.category_description}</h3>
                    <DataTable
                        value={sites}
                        scrollable={true}
                        style={{width: '100%'}}
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
                    Current Inaccessible Sites for {this.props.query.country}
                </h2>
                <Nav tabs>
                    {this.props.country_list.map(country =>
                        this.link_get(country)
                    )}
                </Nav>
                <br />

                {Object.entries(this.props.category).map(([_, category]) =>
                    this.summary_get_category(category)
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
            e.preventDefault();

            anomaly_current_fetch(dispatch, country);
            asn_fetch(dispatch, country);
            site_fetch(dispatch, country);
            dispatch(make_anomaly_current(country));
        },

        handle_load() {
            anomaly_current_fetch(dispatch, this.props.query.country);
            asn_fetch(dispatch, this.props.query.country);
            site_fetch(dispatch, this.props.query.country);
        }
    })
)(AnomalyCurrentWidget);
