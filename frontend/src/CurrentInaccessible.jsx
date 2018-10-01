import React, {Component} from 'react';
import {Nav, NavItem, NavLink, Navbar, NavbarBrand} from 'reactstrap';
import {connect} from 'react-redux';
import {DataTable} from 'primereact/datatable';

class CurrentInaccessibleWidget extends Component {
    constructor(props) {
        super(props);

        this.handle_load = props.handle_load.bind(this);
        this.handle_click = props.handle_click.bind(this);
    }

    componentDidMount() {
        this.refresh(this.props.country);
    }

    refresh(country) {
        fetch(
            `http://api.blockornot.today/api/anomaly/country/${country}`
        ).then(this.handle_load);
    }

    link_get(country) {
        return (
            <NavItem>
                <NavLink onClick={e => this.handle_click(e, country)} href="#">
                    {country}
                </NavLink>
            </NavItem>
        );
    }

    render() {
        return (
            <div>
                <Navbar color="light" light expand="md">
                    <NavbarBrand href="/">
                        Current Inaccessible Sites
                    </NavbarBrand>
                    <Nav className="ml-auto" navbar>
                        {this.link_get('my')}
                        {this.link_get('vn')}
                        {this.link_get('mm')}
                        {this.link_get('id')}
                        {this.link_get('kh')}
                    </Nav>
                </Navbar>

                <DataTable value={this.props.data} />
            </div>
        );
    }
}

export default connect(
    state => ({
        data: state.data || []
    }),
    dispatch => ({
        handle_click(e, country) {
            e.preventDefault();

            this.props.delegate_navigate([country]);
            this.refresh(country);
        },
        handle_load(response) {
            response.json().then(result => {
                this.props.delegate_populate(
                    result.sites.map(sites => {
                        sites.map(site => {
                            site.as_list.reduce(
                                (current, incoming) =>
                                    Object.assign(current, {
                                        [incoming.as_number]:
                                            incoming.measurements.length > 0
                                    }),
                                {
                                    site_url: site.site_url,
                                    country: result.country
                                }
                            );
                        });
                    })
                );
            });
        }
    })
)(CurrentInaccessibleWidget);
