import React, {Component} from 'react';
import {connect} from 'react-redux';
import {DataTable} from 'primereact/datatable';
import {Column} from 'primereact/column';
import ReactJson from 'react-json-view';

export function make_anomaly_incident(date, country, site, measurement_id) {
    return {
        type: 'GO_ANOMALY_INCIDENT',
        query: {
            type: 'ANOMALY_INCIDENT',
            date: date,
            country: country,
            site: site,
            measurement_id: measurement_id
        }
    };
}

function make_populate_incident(data) {
    return {
        type: 'POPULATE_INCIDENT',
        data: data
    };
}

class AnomalyIncidentWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    parameter_get_table() {
        let data = [
            {parameter: 'input', value: this.props.query.site},
            {
                parameter: 'date',
                value: `${this.props.query.date.getFullYear()}-${this.props.query.date.getMonth() +
                    1}-${this.props.query.date.getDate()}`
            },
            {parameter: 'country', value: this.props.query.country},
            {
                parameter: 'measurement_id',
                value: this.props.query.measurement_id
            }
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
        console.log(this.props.incident);
        return (
            <div>
                <h2>
                    Anomaly report for measurement{' '}
                    {this.props.query.measurement_id}
                </h2>

                {this.parameter_get_table()}

                <div key="measurements">
                    <h3>Anomaly details</h3>
                    <ReactJson
                        collapsed="2"
                        src={
                            this.props.incident[
                                this.props.query.measurement_id
                            ] || {}
                        }
                    />
                </div>
            </div>
        );
    }
}

export default connect(
    state => ({
        incident: state.incident || {}
    }),
    dispatch => ({
        handle_load() {
            fetch(
                `https://api.ooni.io/api/v1/measurement/${
                    this.props.query.measurement_id
                }`
            )
                .then(response => response.json())
                .then(data =>
                    dispatch(
                        make_populate_incident({
                            [this.props.query.measurement_id]: data
                        })
                    )
                );
        }
    })
)(AnomalyIncidentWidget);
