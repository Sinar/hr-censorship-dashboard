import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import { ListGroup, ListGroupItem } from "reactstrap";
import React, { useEffect } from "react";
import { incident_fetch, wikidata_fetch } from "../libraries/fetcher";
import { useDispatch, useSelector } from "react-redux";

import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import ReactJson from "react-json-view";
import { Spinner } from "reactstrap";
import { useParams } from "react-router";

function event_empty_list(loading) {
  return loading.length === 0 ? (
    <p>No data from wikidata</p>
  ) : (
    <Spinner color="primary" />
  );
}

function event_get_list(eventList, loading) {
  return (
    (eventList.length > 0 && (
      <ListGroup>
        {eventList.map((event) => (
          <ListGroupItem key={event.link} tag="a" href={event.link}>
            {event.label}
          </ListGroupItem>
        ))}
      </ListGroup>
    )) ||
    event_empty_list(loading)
  );
}

function incident_get_country(incident) {
  return (incident?.probe_cc || "").toLowerCase();
}

function incident_get_date(incident) {
  let date = incident_parse_date(incident);

  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function incident_parse_date(incident) {
  return incident
    ? new Date(`${incident.measurement_start_time}Z`)
    : new Date();
}

function page_get_breadcrumbs(incident, report_id) {
  return (
    typeof incident !== "undefined" || (
      <div>
        <br />
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/summary/${new Date().getFullYear()}`}>Home</Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link to={`/summary/${incident_parse_date().getFullYear()}`}>
              {incident_parse_date().getFullYear()}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link
              to={`/summary/${incident_parse_date().getFullYear()}/${incident_get_country(
                incident
              )}`}
            >
              {incident_get_country(incident) &&
                Countries.getName(incident_get_country(incident))}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <Link
              to={`/summary/${incident_parse_date(
                incident
              ).getFullYear()}/${incident_get_country(incident)}/${
                incident?.input
              }`}
            >
              {incident?.input}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>{report_id}</BreadcrumbItem>
        </Breadcrumb>
      </div>
    )
  );
}

function parameter_get_table(incident, report_id) {
  let data = [
    {
      parameter: "input",
      value: incident?.input || "n/a",
    },
    {
      parameter: "date",
      value: incident_get_date(incident),
    },
    {
      parameter: "country",
      value:
        (incident_get_country(incident) &&
          Countries.getName(incident_get_country(incident))) ||
        "n/a",
    },
    {
      parameter: "report_id",
      value: report_id,
    },
  ];

  return (
    <div key="parameter">
      <h3>Parameters</h3>
      <DataTable value={data}>
        <Column key="parameter" field="parameter" header="Parameter" />
        <Column
          key="value"
          field="value"
          header="Value"
          style={{ overflowWrap: "break-word" }}
        />
      </DataTable>
    </div>
  );
}

export default function Widget() {
  const urlComponent = useParams();
  const incidentList = useSelector((state) => state.incident);
  const dispatch = useDispatch();
  const wikidataList = useSelector((state) => state.wikidata);

  useEffect(() => {
    if (
      !(urlComponent.site in (incidentList?.[urlComponent.report_id] || {}))
    ) {
      incident_fetch(dispatch, urlComponent.report_id, urlComponent.site);
    }
  }, [urlComponent.report_id, urlComponent.site, incidentList, dispatch]);

  useEffect(() => {
    if (urlComponent.site in (incidentList?.[urlComponent.report_id] || {})) {
      let country = incident_get_country(
          incidentList[urlComponent.report_id][urlComponent.site]
        ),
        date = incident_get_date(
          incidentList[urlComponent.report_id][urlComponent.site]
        );

      if (!(date in (wikidataList?.[country] || {}))) {
        wikidata_fetch(dispatch, country, date);
      }
    }
  }, [
    urlComponent.site,
    urlComponent.report_id,
    incidentList,
    wikidataList,
    dispatch,
  ]);

  return (
    <div>
      {page_get_breadcrumbs(
        incidentList?.[urlComponent.report_id]?.[urlComponent.site],
        urlComponent.report_id
      )}

      <h2 className="my-5">
        Anomaly report for measurement {urlComponent.measurement_id}
      </h2>

      <div className="my-5" key="parameters">
        {parameter_get_table(
          incidentList?.[urlComponent.report_id]?.[urlComponent.site],
          urlComponent.report_id
        )}
      </div>

      <div className="my-5" key="events">
        <h3>Notable events</h3>
        {event_get_list(
          wikidataList?.[
            incident_get_country(
              incidentList?.[urlComponent.report_id]?.[urlComponent.site]
            )
          ]?.[
            incident_get_date(
              incidentList?.[urlComponent.report_id]?.[urlComponent.site]
            )
          ] || [],
          useSelector((state) => state.task.loading)
        )}
      </div>

      <div className="my-5" key="measurements">
        <h3>Raw measurement details</h3>
        <ReactJson
          collapsed="2"
          src={incidentList?.[urlComponent.report_id]?.[urlComponent.site]}
        />
      </div>
    </div>
  );
}
