import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import React, { Component, useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { isp_fetch, measurement_fetch } from "../libraries/fetcher.js";

import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import { reset } from "../features/ui/TaskSlice";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

//class AnomalySiteWidget extends Component {
//  constructor(props) {
//    super(props);
//
//    this.handle_load = props.handle_load.bind(this);
//    this.handle_click_row = props.handle_click_row.bind(this);
//
//    this.measurement_get_template = this.measurement_get_template.bind(this);
//  }
//
//  componentDidMount() {
//    this.handle_load();
//  }
//
//
//
//export default connect(
//  (state) => ({
//    shistory: state.history_site || {},
//    isp: state.isp || {},
//  }),
//  (dispatch) => ({
//
//  })
//)(AnomalySiteWidget);
function anomaly_get_list(
  year,
  country,
  site,
  ispList,
  measurementList,
  history
) {
  return ((ispList || {})[country] || []).map((isp) => {
    let result = null;

    if (
      isp.as_list.some((as) =>
        history_has_asn(as.as_number, year, country, site, measurementList)
      )
    ) {
      result = (
        <div className="my-5" key={isp.isp_name}>
          <h3>{isp.isp_name}</h3>
          {Object.entries(measurementList?.[year]?.[country]?.[site] || {})
            .filter(([asn, _]) => {
              return isp.as_list.map((as) => as.as_number).includes(asn);
            })
            .map(([asn, anomaly_list]) => (
              <div className="my-3" key={asn}>
                <h4>AS{asn}</h4>
                <DataTable
                  value={anomaly_list}
                  onRowClick={(e) =>
                    history.push(`/incident/${e.data.measurement_id}`)
                  }
                >
                  <Column
                    body={measurement_get_template}
                    key="measurement_id"
                    field="measurement_id"
                    header="Measurement ID"
                  />
                  <Column
                    body={anomaly_get_template}
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
                    body={status_get_template}
                    key="failure"
                    field="failure"
                    header="Test error"
                  />
                </DataTable>
              </div>
            ))}
        </div>
      );
    }

    return result;
  });
}

function anomaly_get_template(data_row, _column) {
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

function measurement_get_template(data_row, column) {
  return (
    <Link to={`/incident/${data_row[column.field]}`}>
      {data_row[column.field]}
    </Link>
  );
}

function history_has_asn(asn, year, country, site, measurementList) {
  return asn in (measurementList?.[year]?.[country]?.[site] || {});
}

function page_get_breadcrumbs(year, country, site) {
  return (
    <div>
      <br />
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to={`/summary/${new Date().getFullYear()}`}>Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/summary/${year}`}>{year}</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <Link to={`/summary/${year}/${country}`}>
            {Countries.getName(country)}
          </Link>
        </BreadcrumbItem>
        <BreadcrumbItem active>{site}</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

function parameter_get_table(year, country, site) {
  let data = [
    { parameter: "input", value: site },
    { parameter: "year", value: year },
    { parameter: "probe_cc", value: country },
  ];

  return (
    <div className="my-5" key="parameter">
      <h3>Parameters</h3>
      <DataTable value={data}>
        <Column key="parameter" field="parameter" header="Parameter" />
        <Column key="value" field="value" header="Value" />
      </DataTable>
    </div>
  );
}

function status_get_template(data_row, column) {
  return <span>{data_row[column.field] ? "Yes" : "No"}</span>;
}

export default function Widget() {
  const dispatch = useDispatch();
  const urlComponent = useParams();
  const ispList = useSelector((state) => state.isp);
  const measurementList = useSelector((state) => state.measurement);

  useEffect(() => {
    dispatch(reset());
  }, [urlComponent.year, urlComponent.country, urlComponent.site, dispatch]);

  useEffect(() => {
    if (!(urlComponent.country in ispList)) {
      isp_fetch(dispatch, urlComponent.country);
    }
  }, [dispatch, urlComponent.country, ispList]);

  useEffect(() => {
    if (
      !(
        urlComponent.site in
        (measurementList?.[urlComponent.year]?.[urlComponent.country] || {})
      )
    ) {
      measurement_fetch(
        dispatch,
        urlComponent.year,
        urlComponent.country,
        urlComponent.site
      );
    }
  }, [
    urlComponent.year,
    urlComponent.country,
    urlComponent.site,
    measurementList,
    dispatch,
  ]);

  return (
    <div>
      {page_get_breadcrumbs(
        urlComponent.year,
        urlComponent.country,
        urlComponent.site
      )}

      <h2 className="my-5">Site Anomaly history</h2>
      {parameter_get_table(
        urlComponent.year,
        urlComponent.country,
        urlComponent.site
      )}
      {anomaly_get_list(
        urlComponent.year,
        urlComponent.country,
        urlComponent.site,
        ispList,
        measurementList,
        useHistory()
      )}
    </div>
  );
}
