import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import React, { useEffect } from "react";
import { isp_fetch, measurement_fetch } from "../libraries/fetcher.js";
import { useDispatch, useSelector } from "react-redux";

import { Chart } from "primereact/chart";
import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import _ from "lodash";
import { reset } from "../features/ui/TaskSlice";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

function anomaly_get_list(
  year,
  country,
  site,
  ispList,
  measurementList,
  history
) {
  return [...(ispList?.[country] || [])]
    ?.sort((alpha, beta) => alpha.isp_name.localeCompare(beta.isp_name))
    ?.map((isp) => {
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
            .map(([asn, anomalyList]) => (
              <div className="my-3" key={asn}>
                <h4>AS{asn}</h4>
                {asn_get_graph(anomalyList)}
                {asn_get_table(anomalyList, history, site)}
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

function asn_get_graph(anomalyList) {
  const colors = [
      "#d16ba5",
      "#c777b9",
      "#ba83ca",
      "#aa8fd8",
      "#9a9ae1",
      "#8aa7ec",
      "#79b3f4",
      "#69bff8",
      "#52cffe",
      "#41dfff",
      "#46eefa",
      "#5ffbf1",
    ],
    reducer = function (criteria) {
      return anomalyList?.reduce(
        (current, incoming) => {
          let result = current;

          if (criteria(incoming)) {
            result = current?.map((value, month) =>
              month === new Date(incoming.measurement_start_time).getMonth()
                ? value + 1
                : value
            );
          }

          return result;
        },
        month_get_names().map((_) => 0)
      );
    };
  return (
    <Chart
      type="bar"
      data={{
        labels: month_get_names(),
        datasets: [
          {
            type: "bar",
            label: "anomaly",
            backgroundColor: colors[colors.length - 1],
            data: reducer((incoming) => Boolean(incoming.anomaly)),
          },
          {
            type: "bar",
            label: "confirmed",
            backgroundColor: colors[0],
            data: reducer((incoming) => Boolean(incoming.confirmed)),
          },
        ],
      }}
      options={{
        tooltips: {
          mode: "index",
          intersect: false,
        },
        responsive: true,
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "#495057",
              },
              gridLines: {
                color: "#ebedef",
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "#495057",
              },
              gridLines: {
                color: "#ebedef",
              },
            },
          ],
        },
        legend: {
          labels: {
            fontColor: "#495057",
          },
        },
      }}
    />
  );
}

function asn_get_table(anomalyList, history, site) {
  return (
    <DataTable
      value={anomalyList}
      onRowClick={(e) => history.push(`/incident/${e.data.report_id}/${site}`)}
    >
      <Column
        body={(data_row, column) => (
          <Link to={`/incident/${data_row[column.field]}/${site}`}>
            {data_row[column.field]}
          </Link>
        )}
        key="report_id"
        field="report_id"
        header="Report ID"
        style={{ overflowWrap: "break-word" }}
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
        style={{ overflowWrap: "break-word" }}
      />
      <Column key="test_name" field="test_name" header="Test name" />
      <Column
        body={status_get_template}
        key="failure"
        field="failure"
        header="Test error"
      />
    </DataTable>
  );
}

function history_has_asn(asn, year, country, site, measurementList) {
  return asn in (measurementList?.[year]?.[country]?.[site] || {});
}

function month_get_names() {
  return _.range(12).map((month) =>
    new Date(new Date().getFullYear(), month, 1).toLocaleString("default", {
      month: "long",
    })
  );
}

function page_get_breadcrumbs(year, country, site) {
  return (
    <div className="my-4">
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

      <p>
        This page lists the number of anomalies for a given site, separated by
        Autonomous Systems (AS) provided by each Internet Service Provider
        (ISP). The graph shows the count for each month for the given AS.
      </p>

      {parseInt(urlComponent.year, 10) === 2020 && (
        <p>
          <strong>Important note: </strong>
          Due to the limit set by OONI, we are currently unable to cache the
          list of measurements in our database since year 2020. Hence this page
          is pulling the data directly from OONI's server. Each user is allowed
          to pull only a specified amount of data within an hour, a day and a
          week. Please retry again after an hour if you keep getting message
          saying data is failed to load.
        </p>
      )}

      <p>
        Click on the report ID to load the complete detail for the measurement.
      </p>

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
