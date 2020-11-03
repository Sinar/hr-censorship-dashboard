import { Nav, NavItem, NavLink } from "reactstrap";
import React, { Component } from "react";

import { Column } from "primereact/column";
import Countries from "country-list";
import { DataTable } from "primereact/datatable";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { summary_fetch } from "./fetcher.js";

class AnomalySummaryWidget extends Component {
  constructor(props) {
    super(props);

    this.handle_load = props.handle_load.bind(this);
    this.handle_click = props.handle_click.bind(this);
    this.handle_click_row = props.handle_click_row.bind(this);

    this.country_get_template = this.country_get_template.bind(this);
  }

  componentDidMount() {
    this.handle_load();
  }

  link_get(country) {
    return (
      <NavItem>
        <NavLink onClick={(e) => this.handle_click(e, country)} href="#">
          {country}
        </NavLink>
      </NavItem>
    );
  }

  summary_get_table() {
    return this.props.country_list.map((country) =>
      Object.entries(this.props.category).reduce(
        (current, [code, _]) => {
          current[code] = this.summary_get_category_count(country, code);
          return current;
        },
        {
          country_name: Countries.getName(country),
          country: country,
        }
      )
    );
  }

  summary_get_category_count(country, category) {
    return (
      ((this.props.summary[this.props.match.params.year] || {})[country] || {})[
        category
      ] || 0
    );
  }

  navbar_get_year(year) {
    return (
      <NavItem>
        <NavLink
          href="#"
          active={year === parseInt(this.props.match.params.year, 10)}
          onClick={(e) => this.handle_click(e, year)}
        >
          {year}
        </NavLink>
      </NavItem>
    );
  }

  country_get_template(data_row, column) {
    return (
      <Link to={`/summary/${this.props.match.params.year}/${data_row.country}`}>
        {data_row[column.field]}
      </Link>
    );
  }

  count_get_template(data_row, column) {
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

  render() {
    return (
      <div>
        <h2 className="my-5">Anomaly summary for year {this.props.match.params.year}</h2>
        <Nav tabs>
          {this.navbar_get_year(2020)}
          {this.navbar_get_year(2019)}
          {this.navbar_get_year(2018)}
          {this.navbar_get_year(2017)}
        </Nav>
        <br />
        {Object.keys(this.props.country_list || []).length > 0 && (
          <DataTable
            value={this.summary_get_table()}
            scrollable={true}
            style={{ width: "100%" }}
            onRowClick={this.handle_click_row}
          >
            <Column
              body={this.country_get_template}
              key="country"
              field="country_name"
              header="Country"
              style={{ width: "10em" }}
            />
            {Object.keys(this.props.category)
              .sort()
              .map((code) => (
                <Column
                  body={this.count_get_template}
                  key={code}
                  field={code}
                  header={code}
                  style={{ width: "75px" }}
                />
              ))}
          </DataTable>
        )}
      </div>
    );
  }
}

export default connect(
  (state) => ({
    country_list: state.country || [],
    category: state.category || {},
    summary: state.summary || {},
  }),
  (dispatch) => ({
    handle_click(e, year) {
      e.preventDefault();

      if (!this.props.summary[year]) {
        summary_fetch(
          dispatch,
          this.props.delegate_loading_populate,
          this.props.delegate_loading_done,
          year
        );
      }

      this.props.history.push(`/summary/${year}`);
    },

    handle_click_row(e) {
      this.props.history.push(
        `/summary/${this.props.match.params.year}/${e.data.country}`
      );
    },

    handle_load() {
      this.props.delegate_loading_reset();

      if (!this.props.summary[this.props.match.params.year]) {
        summary_fetch(
          dispatch,
          this.props.delegate_loading_populate,
          this.props.delegate_loading_done,
          this.props.match.params.year
        );
      }
    },
  })
)(AnomalySummaryWidget);