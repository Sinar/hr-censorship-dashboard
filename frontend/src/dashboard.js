export default function dashboardApp(state = {}, action) {
    let result;

    switch (action.type) {
        case 'POPULATE_ANOMALY_CURRENT':
            result = populate_anomaly_current(state, action);
            break;

        case 'POPULATE_ASN':
            result = populate_asn(state, action);
            break;

        case 'POPULATE_CATEGORY':
            result = populate_category(state, action);
            break;

        case 'POPULATE_COUNTRY':
            result = populate_country(state, action);
            break;

        case 'POPULATE_SITE':
            result = populate_site(state, action);
            break;

        case 'POPULATE_SUMMARY':
            result = populate_summary(state, action);
            break;

        case 'GO_ANOMALY_COUNTRY':
        case 'GO_ANOMALY_CURRENT':
        case 'GO_ANOMALY_SUMMARY':
            result = query_update(state, action);
            break;
        default:
            result = Object.assign({}, state);
    }

    return result;
}

function query_update(state, action) {
    return Object.assign({}, state, {
        query: Object.assign({}, action.query)
    });
}

function populate_anomaly_current(state, action) {
    return Object.assign({}, state, {
        current: Object.assign({}, state.current || {}, action.data)
    });
}

function populate_asn(state, action) {
    return Object.assign({}, state, {
        asn: Object.assign({}, state.asn, action.data)
    });
}

function populate_category(state, action) {
    return Object.assign({}, state, {
        category: action.data
    });
}

function populate_country(state, action) {
    return Object.assign({}, state, {
        country: action.data
    });
}

function populate_site(state, action) {
    return Object.assign({}, state, {
        site: Object.assign({}, state.site || {}, action.data)
    });
}

function populate_summary(state, action) {
    return Object.assign({}, state, {
        summary: Object.assign({}, state.summary || {}, action.data)
    });
}
