import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import React, { Component } from "react";
import { isp_fetch, site_fetch_history } from "./fetcher.js";

import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

class AnomalySiteWidget extends Component {
  constructor(props) {
    super(props);

    this.handle_load = props.handle_load.bind(this);
    this.handle_click_row = props.handle_click_row.bind(this);

    this.measurement_get_template = this.measurement_get_template.bind(this);
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

  page_get_breadcrumbs() {
    return (
      <div>
        <br />
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/summary/${new Date().getFullYear()}`}>Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/summary/${this.props.match.params.year}`}>
              {this.props.match.params.year}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link
              to={`/summary/${this.props.match.params.year}/${this.props.match.params.country}`}
            >
              {Countries.getName(this.props.match.params.country)}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>{this.props.match.params.site}</BreadcrumbItem>
        </Breadcrumb>
      </div>
    );
  }

  status_get_template(data_row, column) {
    return <span>{data_row[column.field] ? "Yes" : "No"}</span>;
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
        ref={(ref) => {
          if (ref) {
            ref.parentElement.classList.remove(
              "bg-danger",
              "bg-warning",
              "bg-success"
            );
            ref.parentElement.classList.add(
              "text-white",
              outcome("bg-danger", "bg-warning", "bg-success")
            );
          }
        }}
      >
        {outcome("Yes (confirmed)", "Yes (unconfirmed)", "No")}
      </span>
    );
  }

  history_has_asn(asn) {
    return Object.keys(
      (((this.props.shistory || {})[this.props.match.params.year] || {})[
        this.props.match.params.country
      ] || {})[this.props.match.params.site] || {}
    ).includes(asn);
  }

  anomaly_get_list() {
    return ((this.props.isp || {})[this.props.match.params.country] || []).map(
      (isp) => {
        let result = null;

        if (isp.as_list.some((as) => this.history_has_asn(as.as_number))) {
          result = (
            <div key={isp.isp_name}>
              <h3>{isp.isp_name}</h3>
              {Object.entries(
                (((this.props.shistory || {})[this.props.match.params.year] ||
                  {})[this.props.match.params.country] || {})[
                  this.props.match.params.site
                ] || {}
              )
                .filter(([asn, _]) => {
                  return isp.as_list.map((as) => as.as_number).includes(asn);
                })
                .map(([asn, anomaly_list]) => {
                  return (
                    <div key={asn}>
                      <h4>{asn}</h4>
                      <DataTable
                        value={anomaly_list}
                        onRowClick={this.handle_click_row}
                      >
                        <Column
                          body={this.measurement_get_template}
                          key="measurement_id"
                          field="measurement_id"
                          header="Measurement ID"
                        />
                        <Column
                          body={this.anomaly_get_template}
                          key="anomaly"
                          field="anomaly"
                          header="Is anomaly"
                        />
                        <Column
                          key="measurement_start_time"
                          field="measurement_start_time"
                          header="Measurement Time"
                        />
                        <Column
                          key="measurement_url"
                          field="measurement_url"
                          header="Measurement URL"
                        />
                        <Column
                          key="test_name"
                          field="test_name"
                          header="Test name"
                        />
                        <Column
                          body={this.status_get_template}
                          key="failure"
                          field="failure"
                          header="Test error"
                        />
                      </DataTable>
                    </div>
                  );
                })}
            </div>
          );
        }

        return result;
      }
    );
  }

  parameter_get_table() {
    let data = [
      { parameter: "input", value: this.props.match.params.site },
      { parameter: "year", value: this.props.match.params.year },
      { parameter: "probe_cc", value: this.props.match.params.country },
    ];

    return (
      <div key="parameter">
        <h3>Parameters</h3>
        <DataTable value={data}>
          <Column key="parameter" field="parameter" header="Parameter" />
          <Column key="value" field="value" header="Value" />
        </DataTable>
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.page_get_breadcrumbs()}

        <h2>Site Anomaly history</h2>
        {this.parameter_get_table()}
        {this.anomaly_get_list()}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    shistory: state.history_site || {},
    isp: state.isp || {},
  }),
  (dispatch) => ({
    handle_load() {
      this.props.delegate_loading_reset();

      if (
        !((this.props.shistory[this.props.match.params.year] || {})[
          this.props.match.params.country
        ] || {})[this.props.match.params.site]
      ) {
        site_fetch_history(
          dispatch,
          this.props.delegate_loading_populate,
          this.props.delegate_loading_done,
          this.props.match.params.year,
          this.props.match.params.country,
          this.props.match.params.site
        );
      }

      if (!this.props.isp[this.props.match.params.country]) {
        isp_fetch(
          dispatch,
          this.props.delegate_loading_populate,
          this.props.delegate_loading_done,
          this.props.match.params.country
        );
      }
    },

    handle_click_row(e) {
      this.props.history.push(`/incident/${e.data.measurement_id}`);
    },
  })
)(AnomalySiteWidget);
