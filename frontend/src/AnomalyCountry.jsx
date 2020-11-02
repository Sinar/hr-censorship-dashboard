import {
    Breadcrumb,
    BreadcrumbItem,
    Button,
    ButtonGroup,
    Nav,
    NavItem,
    NavLink
} from 'reactstrap';
import React, {Component} from 'react';
import {
    country_history_fetch,
    isp_fetch,
    site_fetch,
    summary_fetch
} from './fetcher.js';

import {Column} from 'primereact/column';
import Countries from 'country-list';
import {DataTable} from 'primereact/datatable';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';

class AnomalyCountryWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click_country = props.handle_click_country.bind(this);
        this.handle_click_year = props.handle_click_year.bind(this);
        this.handle_click_row = props.handle_click_row.bind(this);

        this.site_get_template = this.site_get_template.bind(this);
    }

    componentDidMount() {
        this.handle_load();
    }

    country_get_tab(country) {
        return (
            <NavItem key={country}>
                <NavLink
                    active={country === this.props.match.params.country}
                    onClick={e => this.handle_click_country(e, country)}
                >
                    {country}
                </NavLink>
            </NavItem>
        );
    }

    year_get_button(year) {
        return (
            <Button
                key={year}
                color={
                    (year === parseInt(this.props.match.params.year, 10) &&
                        'primary') ||
                    'secondary'
                }
                onClick={e => this.handle_click_year(e, year)}
            >
                {year}
            </Button>
        );
    }

    summary_get_table() {
        let data =
            Object.entries(
                this.props.summary?.[this.props.match.params.year]?.[
                    this.props.match.params.country
                ] || {}
            ).map(([category_code, count]) => ({
                category: category_code,
                description: this.props.category?.[category_code]
                    ?.category_description,
                count: count
            })) || [];
        return (
            <DataTable value={data}>
                <Column
                    key="category"
                    field="category"
                    header="Category code"
                />
                <Column
                    key="description"
                    field="description"
                    header="Category description"
                />
                <Column key="count" field="count" header="Anomaly count" />
            </DataTable>
        );
    }

    category_get_sites(category) {
        return (
            this.props.site?.[this.props.match.params.country]?.[
                category.category_code
            ]
                ?.reduce((current, site) => {
                    let anomaly = this.props.chistory?.[
                        this.props.match.params.year
                    ]?.[this.props.match.params.country]?.[site.url];

                    current.push(
                        this.props.isp?.[
                            this.props.match.params.country
                        ].reduce(
                            (current_site, isp) => {
                                current_site[isp.isp_name] =
                                    anomaly?.[isp.isp_name] || 0;
                                return current_site;
                            },
                            {site: site.url}
                        )
                    );

                    return current;
                }, [])
                ?.filter(site =>
                    Object.entries(site || {}).some(
                        ([property, value]) => property === 'name' || value > 0
                    )
                ) || []
        );
    }

    count_get_template(data_row, column) {
        return (
            <span
                ref={ref => {
                    if (ref) {
                        ref.parentElement.classList.remove(
                            'text-white',
                            'bg-info'
                        );

                        data_row[column.field] !== 0 &&
                            ref.parentElement.classList.add(
                                'text-white',
                                'bg-info'
                            );
                    }
                }}
            >
                {data_row[column.field]}
            </span>
        );
    }

    page_get_breadcrumbs() {
        return (
            <div>
                <br />
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to={`/summary/${(new Date().getFullYear())}`}>Home</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to={`/summary/${this.props.match.params.year}`}>
                            {this.props.match.params.year}
                        </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {Countries.getName(this.props.match.params.country)}
                    </BreadcrumbItem>
                </Breadcrumb>
            </div>
        );
    }

    site_get_template(data_row, column) {
        return (
            <Link
                to={`/summary/${this.props.match.params.year}/${this.props.match.params.country}/${data_row.site}`}
            >
                {data_row[column.field]}
            </Link>
        );
    }

    category_get_summary(category) {
        let sites = this.category_get_sites(category);

        let result = null;

        if (sites.length > 0) {
            result = (
                <div key={category.category_code}>
                    <h3>{category.category_description}</h3>
                    <DataTable
                        value={sites}
                        scrollable={true}
                        style={{width: '100%'}}
                        onRowClick={this.handle_click_row}
                    >
                        <Column
                            body={this.site_get_template}
                            key="site"
                            field="site"
                            header="Site URL"
                            style={{width: '350px'}}
                        />
                        {this.props.isp?.[this.props.match.params.country]
                            .filter(isp =>
                                sites.some(site => {
                                    return site[isp.isp_name] > 0;
                                })
                            )
                            .map(isp => (
                                <Column
                                    body={this.count_get_template}
                                    key={isp.isp_name}
                                    field={isp.isp_name}
                                    header={isp.isp_name}
                                    style={{width: '100px'}}
                                />
                            ))}
                    </DataTable>
                </div>
            );
        }

        return result;
    }

    render() {
        return (
            <div>
                {this.page_get_breadcrumbs()}
                <h2>
                    Anomaly summary for{' '}
                    {Countries.getName(this.props.match.params.country)} in year{' '}
                    {this.props.match.params.year}
                </h2>

                <Nav tabs>
                    {this.props.country_list.map(country =>
                        this.country_get_tab(country)
                    )}
                </Nav>

                <br />

                <ButtonGroup>
                    {this.year_get_button(2020)}
                    {this.year_get_button(2019)}
                    {this.year_get_button(2018)}
                    {this.year_get_button(2017)}
                </ButtonGroup>

                <h3>Overview</h3>

                {this.summary_get_table()}

                {Object.entries(
                    (this.props.summary[this.props.match.params.year] || {})[
                        this.props.match.params.country
                    ] || {}
                ).map(([category_code, _]) =>
                    this.category_get_summary(
                        this.props.category[category_code] || {}
                    )
                )}
            </div>
        );
    }
}

export default connect(
    state => ({
        summary: state.summary || {},
        chistory: state.history || {},
        country_list: state.country || [],
        site: state.site || {},
        category: state.category || {},
        isp: state.isp || {}
    }),
    dispatch => ({
        handle_click_country(e, country) {
            e.preventDefault();

            this.props.delegate_loading_reset();

            if (!this.props.isp[country]) {
                isp_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    country
                );
            }

            if (!this.props.site[country]) {
                site_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    country
                );
            }

            if (
                !this.props.chistory?.[this.props.match.params.year]?.[country]
            ) {
                country_history_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    this.props.match.params.year,
                    country
                );
            }

            this.props.history.push(
                `/summary/${this.props.match.params.year}/${country}`
            );
        },

        handle_click_row(e) {
            this.props.history.push(
                `/summary/${this.props.match.params.year}/${this.props.match.params.country}/${e.data.site}`
            );
        },

        handle_click_year(e, year) {
            e.preventDefault();

            this.props.delegate_loading_reset();

            if (
                !this.props.chistory?.[year]?.[this.props.match.params.country]
            ) {
                country_history_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    year,
                    this.props.match.params.country
                );
            }

            this.props.history.push(
                `/summary/${year}/${this.props.match.params.country}`
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

            if (!this.props.isp[this.props.match.params.country]) {
                isp_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    this.props.match.params.country
                );
            }

            if (!this.props.site[this.props.match.params.country]) {
                site_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    this.props.match.params.country
                );
            }

            if (
                !this.props.chistory?.[this.props.match.params.year]?.[
                    this.props.match.params.country
                ]
            ) {
                country_history_fetch(
                    dispatch,
                    this.props.delegate_loading_populate,
                    this.props.delegate_loading_done,
                    this.props.match.params.year,
                    this.props.match.params.country
                );
            }
        }
    })
)(AnomalyCountryWidget);
