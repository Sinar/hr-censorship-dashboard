import React, {Component} from 'react';
import {connect} from 'react-redux';
import {country_history_fetch} from './fetcher.js';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {make_anomaly_incident} from './AnomalyIncident';

export function make_anomaly_site(year, country, site) {
    return {
        type: 'GO_ANOMALY_SITE',
        query: {
            type: 'ANOMALY_SITE',
            year: year,
            country: country,
            site: site
        }
    };
}

class AnomalySiteWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    anomaly_get_list() {
        return Object.entries(
            ((this.props.history[this.props.query.year] || {})[
                this.props.query.country
            ] || {})[this.props.query.site] || {}
        ).map(([asn, anomaly_list]) => {
            return (
                <div key={asn}>
                    <h3>{asn}</h3>
                    <DataTable
                        value={anomaly_list}
                        onRowClick={this.handle_click_row}
                    >
                        <Column
                            key="anomaly"
                            field="anomaly"
                            header="anomaly"
                        />
                        <Column
                            key="confirmed"
                            field="confirmed"
                            header="confirmed"
                        />
                        <Column
                            key="failure"
                            field="failure"
                            header="failure"
                        />
                        <Column
                            key="measurement_id"
                            field="measurement_id"
                            header="measurement_id"
                        />
                        <Column
                            key="measurement_start_time"
                            field="measurement_start_time"
                            header="measurement_start_time"
                        />
                        <Column
                            key="measurement_url"
                            field="measurement_url"
                            header="measurement_url"
                        />
                        <Column
                            key="test_name"
                            field="test_name"
                            header="test_name"
                        />
                    </DataTable>
                </div>
            );
        });
    }

    parameter_get_table() {
        let data = [
            {parameter: 'input', value: this.props.query.site},
            {parameter: 'year', value: this.props.query.year},
            {parameter: 'probe_cc', value: this.props.query.country}
        ];

        return (
            <div key="parameter">
                <h3>Parameters</h3>
                <DataTable value={data}>
                    <Column
                        key="parameter"
                        field="parameter"
                        header="Parameter"
                    />
                    <Column key="value" field="value" header="Value" />
                </DataTable>
            </div>
        );
    }

    render() {
        return (
            <div>
                <h2>Site Anomaly history</h2>
                {this.parameter_get_table()}
                {this.anomaly_get_list()}
            </div>
        );
    }
}

export default connect(
    state => ({
        history: state.history || {}
    }),
    dispatch => ({
        handle_load() {
            let history_date = new Date();

            this.props.delegate_loading_reset();

            this.props.delegate_loading_populate(history_date);
            country_history_fetch(
                dispatch,
                () => this.props.delegate_loading_done(history_date),
                this.props.query.year,
                this.props.query.country
            );
        },

        handle_click_row(e) {
            dispatch(
                make_anomaly_incident(
                    new Date(`${e.data.measurement_start_time}Z`),
                    this.props.query.country,
                    this.props.query.site,
                    e.data.measurement_id
                )
            );
        }
    })
)(AnomalySiteWidget);
