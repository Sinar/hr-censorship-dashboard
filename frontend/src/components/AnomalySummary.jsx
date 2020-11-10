import { Nav, NavItem, NavLink } from "reactstrap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import _ from "lodash";
import { reset } from "../features/ui/TaskSlice";
import { summary_fetch } from "../libraries/fetcher";

function handle_click_row(e, history, year) {
  history.push(`/summary/${year}/${e.data.country}`);
}

function count_get_template(data_row, column) {
  return (
    <span
      ref={(ref) => {
        if (ref) {
          ref.parentElement.classList.remove("text-white", "bg-info");

          data_row[column.field] !== 0 &&
            ref.parentElement.classList.add("text-white", "bg-info");
        }
      }}
    >
      {data_row[column.field]}
    </span>
  );
}

function navbar_get_year(current, year) {
  return (
    <NavItem key={year}>
      <NavLink
        tag={(props) => {
          return <Link to={`/summary/${year}`} {...props}></Link>;
        }}
        active={year === parseInt(current, 10)}
      >
        {year}
      </NavLink>
    </NavItem>
  );
}

function summary_get_table(summary, year, countryList, categoryList) {
  return countryList
    ?.map((country) =>
      Object.entries(categoryList).reduce(
        (current, [code, _]) => {
          current[code] = summary?.[year]?.[country]?.[code] || 0;
          return current;
        },
        {
          country_name: Countries.getName(country),
          country: country,
        }
      )
    )
    .sort((alpha, beta) => alpha.country_name.localeCompare(beta.country_name));
}

export default function Widget() {
  const dispatch = useDispatch();
  const urlComponent = useParams();
  const countryList = useSelector((state) => state.country);
  const categoryList = useSelector((state) => state.category);
  const summary = useSelector((state) => state.summary);
  const history = useHistory();

  useEffect(() => {
    dispatch(reset());

    if (!(urlComponent.year in summary)) {
      summary_fetch(dispatch, urlComponent.year);
    }
  }, [urlComponent.year, summary, dispatch]);

  return (
    <React.Fragment>
      <h2 className="my-5">Anomaly summary for year {urlComponent.year}</h2>
      <Nav tabs>
        {_.range(2017, new Date().getFullYear() + 1)
          .reverse()
          .map((year) => navbar_get_year(urlComponent.year, year))}
      </Nav>

      <div className="my-3">
        <p>
          The table below shows an overview of interview censorship for each
          respective country. The data is collected by the{" "}
          <a href="https://ooni.org/">
            Open Observatory of Network Interference (OONI)
          </a>{" "}
          through contributions by volunteers submitting their measurement
          reports.
        </p>
        <p>
          Each number in the table is the number of sites volunteers in the
          respective country found inaccessible (an anomaly) through OONI's
          probe. Each column corresponds to a category, defined by the{" "}
          <a href="https://github.com/citizenlab/test-lists">test list</a>,
          where each site is assigned one. Non-zero entries are shaded to aid
          reading.
        </p>
        <p>
          Clicking any row or the country name will load further details for the
          respective country.
        </p>
      </div>

      {Object.keys(countryList || []).length > 0 && (
        <DataTable
          value={summary_get_table(
            summary,
            urlComponent.year,
            countryList,
            categoryList
          )}
          scrollable={true}
          style={{ width: "100%" }}
          onRowClick={(e) => handle_click_row(e, history, urlComponent.year)}
        >
          <Column
            body={(data_row, column) => (
              <Link to={`/summary/${urlComponent.year}/${data_row.country}`}>
                {data_row[column.field]}
              </Link>
            )}
            key="country"
            field="country_name"
            header="Country"
            style={{ width: "10em" }}
          />
          {Object.keys(categoryList)
            .sort()
            .map((code) => (
              <Column
                body={count_get_template}
                key={code}
                field={code}
                header={code}
                style={{ width: "75px" }}
              />
            ))}
        </DataTable>
      )}

      <div className="my-3">
        <p>
          When an entry is zero, it may be because OONI does not have data
          reporting an anomaly for the respective country and category, or we
          did not collect data for that case in the particular year. In that
          case, please use the OONI's data explorer, or contribute by joining
          the measurement or maintaining the test list.
        </p>
        <p>
          If you are interested in contributing to internet censorship research,
          please follow{" "}
          <a href="https://ooni.org/install/">this guide from OONI</a>. On the
          other hand, if you are interested in help maintaining the list of
          websites to be measured, please check{" "}
          <a href="https://ooni.org/get-involved/contribute-test-lists/">
            this page
          </a>{" "}
          for more information.
        </p>
      </div>
    </React.Fragment>
  );
}
