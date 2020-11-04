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

function summary_get_table(summary, countryList, categoryList) {
  return countryList.map((country) =>
    Object.entries(categoryList).reduce(
      (current, [code, _]) => {
        current[code] = summary?.[country]?.[code] || 0;
        return current;
      },
      {
        country_name: Countries.getName(country),
        country: country,
      }
    )
  );
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
    <div>
      <h2 className="my-5">Anomaly summary for year {urlComponent.year}</h2>
      <Nav tabs>
        {_.range(2017, new Date().getFullYear() + 1)
          .reverse()
          .map((year) => navbar_get_year(urlComponent.year, year))}
      </Nav>
      <br />
      {Object.keys(countryList || []).length > 0 && (
        <React.Fragment>
          <DataTable
            value={summary_get_table(
              summary[urlComponent.year],
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
        </React.Fragment>
      )}
    </div>
  );
}
