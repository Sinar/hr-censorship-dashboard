import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  ButtonGroup,
  Nav,
  NavItem,
  NavLink,
} from "reactstrap";
import React, { useEffect } from "react";
import {
  aggregated_fetch,
  isp_fetch,
  site_fetch,
  summary_fetch,
} from "../libraries/fetcher.js";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router";

import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import _ from "lodash";
import { reset } from "../features/ui/TaskSlice";

//
//
//
//    handle_load() {
//    },
//  })
//)(AnomalyCountryWidget);
function category_get_sites(category, siteList, country, aggregated, ispList) {
  return (
    siteList?.[country]?.[category?.category_code]
      ?.reduce((current, site) => {
        let anomaly = aggregated?.[country]?.[site.url];

        current.push(
          ispList?.[country].reduce(
            (current_site, isp) => {
              current_site[isp.isp_name] = anomaly?.[isp.isp_name] || 0;
              return current_site;
            },
            { site: site.url }
          )
        );

        return current;
      }, [])
      ?.filter((site) =>
        Object.entries(site || {}).some(
          ([property, value]) => property !== "site" && value > 0
        )
      ) || []
  );
}

function category_get_summary(
  category,
  siteList,
  country,
  aggregated,
  year,
  ispList,
  history
) {
  let sites = category_get_sites(
    category,
    siteList,
    country,
    aggregated,
    ispList
  );

  let result = null;

  if (sites?.length > 0) {
    result = (
      <div className="my-5" key={category.category_code}>
        <h3>
          {category.category_description} ({sites.length} sites)
        </h3>
        <DataTable
          value={sites}
          scrollable={true}
          style={{ width: "100%" }}
          onRowClick={(e) =>
            history.push(`/summary/${year}/${country}/${e.data.site}`)
          }
        >
          <Column
            body={(data_row, column) => {
              return (
                <Link to={`/summary/${year}/${country}/${data_row.site}`}>
                  {data_row[column.field]}
                </Link>
              );
            }}
            key="site"
            field="site"
            header="Site URL"
            style={{ width: "350px" }}
          />
          {ispList?.[country]
            ?.filter((isp) =>
              sites.some((site) => {
                return site[isp.isp_name] > 0;
              })
            )
            .map((isp) => {
              return (
                <Column
                  body={(data_row, column) => {
                    return (
                      <span
                        ref={(ref) => {
                          if (ref) {
                            ref.parentElement.classList.remove(
                              "text-white",
                              "bg-info"
                            );

                            data_row[column.field] !== 0 &&
                              ref.parentElement.classList.add(
                                "text-white",
                                "bg-info"
                              );
                          }
                        }}
                      >
                        {data_row[column.field]}
                      </span>
                    );
                  }}
                  key={isp.isp_name}
                  field={isp.isp_name}
                  header={isp.isp_name}
                  style={{
                    width: "10em",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                />
              );
            })}
        </DataTable>
      </div>
    );
  }

  return result;
}

function country_get_tab(current, country, year) {
  return (
    <NavItem key={country}>
      <NavLink
        active={country === current}
        tag={(props) => <Link to={`/summary/${year}/${country}`} {...props} />}
      >
        {country}
      </NavLink>
    </NavItem>
  );
}

function page_get_breadcrumbs(year, country) {
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
        <BreadcrumbItem active>{Countries.getName(country)}</BreadcrumbItem>
      </Breadcrumb>
    </div>
  );
}

function summary_get_table(summary, year, country, categoryList) {
  let data =
    Object.entries(summary?.[year]?.[country] || {}).map(
      ([category_code, count]) => ({
        category: category_code,
        description: categoryList?.[category_code]?.category_description,
        count: count,
      })
    ) || [];
  return (
    <DataTable value={data}>
      <Column key="category" field="category" header="Category code" />
      <Column
        key="description"
        field="description"
        header="Category description"
      />
      <Column key="count" field="count" header="Anomaly count" />
    </DataTable>
  );
}

function year_get_button(current, year, country, history) {
  return (
    <Button
      key={year}
      color={(year === parseInt(current, 10) && "primary") || "secondary"}
      onClick={(e) => history.push(`/summary/${year}/${country}`)}
    >
      {year}
    </Button>
  );
}

export default function Widget() {
  const urlComponent = useParams();
  const countryList = useSelector((state) => state.country);
  const dispatch = useDispatch();
  const summary = useSelector((state) => state.summary);
  const ispList = useSelector((state) => state.isp);
  const siteList = useSelector((state) => state.site);
  const aggregated = useSelector(
    (state) => state.aggregated?.[urlComponent.year]
  );
  const categoryList = useSelector((state) => state.category);
  let history = useHistory();

  useEffect(() => {
    dispatch(reset());
  }, [urlComponent.year, urlComponent.country, dispatch]);

  useEffect(() => {
    if (!(urlComponent.year in summary)) {
      summary_fetch(dispatch, urlComponent.year);
    }
  }, [urlComponent.year, dispatch, summary]);

  useEffect(() => {
    if (!(urlComponent.country in ispList)) {
      isp_fetch(dispatch, urlComponent.country);
    }
  }, [dispatch, urlComponent.country, ispList]);

  useEffect(() => {
    if (!(urlComponent.country in siteList)) {
      site_fetch(dispatch, urlComponent.country);
    }
  }, [urlComponent.country, dispatch, siteList]);

  useEffect(() => {
    if (!(urlComponent.country in (aggregated || {}))) {
      aggregated_fetch(dispatch, urlComponent.year, urlComponent.country);
    }
  }, [aggregated, urlComponent.year, urlComponent.country, dispatch]);

  return (
    <React.Fragment>
      {page_get_breadcrumbs(urlComponent.year, urlComponent.country)}
      <h2 className="my-5">
        Anomaly summary for {Countries.getName(urlComponent.country)} in year{" "}
        {urlComponent.year}
      </h2>

      <Nav className="my-3" tabs>
        {countryList.map((country) =>
          country_get_tab(urlComponent.country, country, urlComponent.year)
        )}
      </Nav>

      <ButtonGroup className="my-3">
        {_.range(2017, new Date().getFullYear() + 1)
          .reverse()
          .map((year) =>
            year_get_button(
              urlComponent.year,
              year,
              urlComponent.country,
              history
            )
          )}
      </ButtonGroup>

      <h3>Overview</h3>
      {summary_get_table(
        summary,
        urlComponent.year,
        urlComponent.country,
        categoryList
      )}
      {Object.entries(
        summary?.[urlComponent.year]?.[urlComponent.country] || {}
      ).map(([category_code, _]) =>
        category_get_summary(
          categoryList?.[category_code],
          siteList,
          urlComponent.country,
          aggregated,
          urlComponent.year,
          ispList,
          history
        )
      )}
    </React.Fragment>
  );
}
