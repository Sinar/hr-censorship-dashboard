const BASE_URL = 'http://localhost:8000';

function make_populate_anomaly_current(data) {
    return {
        type: 'POPULATE_ANOMALY_CURRENT',
        data: data
    };
}

function make_populate_anomaly_country(data) {
    return {
        type: 'POPULATE_ANOMALY_COUNTRY',
        data: data
    };
}

function make_populate_asn(data) {
    return {
        type: 'POPULATE_ASN',
        data: data
    };
}

function make_populate_category(data) {
    return {
        type: 'POPULATE_CATEGORY',
        data: data
    };
}

function make_populate_country(data) {
    return {
        type: 'POPULATE_COUNTRY',
        data: data
    };
}

function make_populate_site(data) {
    return {
        type: 'POPULATE_SITE',
        data: data
    };
}

function make_populate_summary(data) {
    return {
        type: 'POPULATE_SUMMARY',
        data: data
    };
}

export function anomaly_current_fetch(dispatch, country) {
    fetch(`${BASE_URL}/api/anomaly/country/${country}`)
        .then(response => response.json())
        .then(data => {
            dispatch(
                make_populate_anomaly_current({
                    [country]: data.site_list.reduce((current, site) => {
                        current[site.site_url] = site.as_list.reduce(
                            (_current, asn) => {
                                _current[asn.as_number] = asn.measurements;
                                return _current;
                            },
                            {}
                        );
                        return current;
                    }, {})
                })
            );
        });
}

export function asn_fetch(dispatch, country) {
    fetch(`${BASE_URL}/api/asn/${country}`)
        .then(response => response.json())
        .then(data => dispatch(make_populate_asn({[data.country]: data.asn})));
}

export function category_fetch(dispatch) {
    fetch(`${BASE_URL}/api/category`)
        .then(response => response.json())
        .then(data =>
            dispatch(
                make_populate_category(
                    data['category_list'].reduce((current, incoming) => {
                        current[incoming.category_code] = incoming;
                        return current;
                    }, {})
                )
            )
        );
}

export function country_fetch(dispatch) {
    fetch(`${BASE_URL}/api/country`)
        .then(response => response.json())
        .then(data => dispatch(make_populate_country(data['country_list'])));
}

export function country_history_fetch(dispatch, year, country) {
    fetch(`${BASE_URL}/api/history/year/${year}/country/${country}`)
        .then(response => response.json())
        .then(data => {
            dispatch(
                make_populate_anomaly_country({
                    [year]: {
                        [country]: data.site_list.reduce((current, site) => {
                            current[site.site_url] = site.as_list.reduce(
                                (_current, asn) => {
                                    _current[asn.as_number] = asn.measurements;
                                    return _current;
                                },
                                {}
                            );
                            return current;
                        }, {})
                    }
                })
            );
        });
}

export function site_fetch(dispatch, country) {
    fetch(`${BASE_URL}/api/site/${country}`)
        .then(response => response.json())
        .then(data => {
            return dispatch(
                make_populate_site({
                    [country]: data.category_list.reduce(
                        (current, category) => {
                            current[category.code] = category.site_list;
                            return current;
                        },
                        {}
                    )
                })
            );
        });
}

export function summary_fetch(dispatch, year) {
    fetch(`${BASE_URL}/api/summary/${year}`)
        .then(response => response.json())
        .then(data =>
            dispatch(
                make_populate_summary({
                    [data.year]: data.country_list.reduce(
                        (current, country) => {
                            current[
                                country.country
                            ] = country.category_list.reduce(
                                (_current, category) => {
                                    _current[category.category] =
                                        category.count;
                                    return _current;
                                },
                                {}
                            );
                            return current;
                        },
                        {}
                    )
                })
            )
        );
}
