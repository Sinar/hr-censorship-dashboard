import React, {Component} from 'react';
import {connect} from 'react-redux';
import {country_history_fetch} from './fetcher.js';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import {Link} from 'react-router-dom';

class AnomalySiteWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);

        this.measurement_get_template = this.measurement_get_template.bind(
            this
        );
    }

    componentDidMount() {
        this.handle_load();
    }

    measurement_get_template(data_row, column) {
        return (
            <Link to={`/incident/${data_row[column.field]}`}>
                {data_row[column.field]}
            </Link>
        );
    }

    status_get_template(data_row, column) {
        return (
            <span
                ref={ref => {
                    if (ref) {
                        ref.parentElement.classList.remove(
                            'bg-danger',
                            'bg-success'
                        );
                        ref.parentElement.classList.add(
                            'text-white',
                            data_row[column.field] !== 0
                                ? 'bg-danger'
                                : 'bg-success'
                        );
                    }
                }}
            >
                {data_row[column.field] ? 'Yes' : 'No'}
            </span>
        );
    }

    anomaly_get_template(data_row, _column) {
        let outcome = (confirmed, unconfirmed, safe) => {
            if (data_row.anomaly === 0) {
                return safe;
            } else if (data_row.confirmed === 0) {
                return unconfirmed;
            } else {
                return confirmed;
            }
        };

        return (
            <span
                ref={ref => {
                    if (ref) {
                        ref.parentElement.classList.remove(
                            'bg-danger',
                            'bg-warning',
                            'bg-success'
                        );
                        ref.parentElement.classList.add(
                            'text-white',
                            outcome('bg-danger', 'bg-warning', 'bg-success')
                        );
                    }
                }}
            >
                {outcome('Yes, confirmed', 'Yes, unconfirmed', 'No')}
            </span>
        );
    }

    anomaly_get_list() {
        return Object.entries(
            ((this.props.chistory[this.props.match.params.year] || {})[
                this.props.match.params.country
            ] || {})[this.props.match.params.site] || {}
        ).map(([asn, anomaly_list]) => {
            return (
                <div key={asn}>
                    <h3>{asn}</h3>
                    <DataTable
                        value={anomaly_list}
                        onRowClick={this.handle_click_row}
                    >
                        <Column
                            body={this.measurement_get_template}
                            key="measurement_id"
                            field="measurement_id"
                            header="measurement_id"
                        />
                        <Column
                            body={this.anomaly_get_template}
                            key="anomaly"
                            field="anomaly"
                            header="anomaly"
                        />
                        <Column
                            body={this.status_get_template}
                            key="failure"
                            field="failure"
                            header="failure"
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
            {parameter: 'input', value: this.props.match.params.site},
            {parameter: 'year', value: this.props.match.params.year},
            {parameter: 'probe_cc', value: this.props.match.params.country}
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
        chistory: state.history || {}
    }),
    dispatch => ({
        handle_load() {
            let history_date = new Date();

            this.props.delegate_loading_reset();

            this.props.delegate_loading_populate(history_date);
            country_history_fetch(
                dispatch,
                () => this.props.delegate_loading_done(history_date),
                this.props.match.params.year,
                this.props.match.params.country
            );
        },

        handle_click_row(e) {
            this.props.history.push(`/incident/${e.data.measurement_id}`);
        }
    })
)(AnomalySiteWidget);
