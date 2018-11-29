export default function dashboardApp(state = {}, action) {
    let result;

    switch (action.type) {
        case 'POPULATE_ANOMALY_CURRENT':
            result = populate_anomaly_current(state, action);
            break;

        case 'POPULATE_ANOMALY_COUNTRY':
            result = populate_anomaly_country(state, action);
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

        case 'POPULATE_INCIDENT':
            result = populate_incident(state, action);
            break;

        case 'POPULATE_LOADING':
            result = populate_loading(state, action);
            break;

        case 'POPULATE_RETRY':
            result = populate_retry(state, action);
            break;

        case 'POPULATE_SITE':
            result = populate_site(state, action);
            break;

        case 'POPULATE_SUMMARY':
            result = populate_summary(state, action);
            break;

        case 'POPULATE_WIKIDATA':
            result = populate_wikidata(state, action);
            break;

        case 'LOADING_DONE':
            result = loading_done(state, action);
            break;

        case 'LOADING_RESET':
            result = loading_reset(state, action);
            break;

        case 'RETRY_DONE':
            result = retry_done(state, action);
            break;

        default:
            result = Object.assign({}, state);
    }

    return result;
}

function populate_anomaly_country(state, action) {
    return Object.assign({}, state, {
        history: Object.assign({}, state.history || {}, action.data)
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

function populate_incident(state, action) {
    return Object.assign({}, state, {
        incident: Object.assign({}, state.incident || {}, action.data)
    });
}

function populate_loading(state, action) {
    return Object.assign({}, state, {
        loading: (state.loading || []).reduce(
            (current, incoming) => {
                current.push(incoming);
                return current;
            },
            [action.date]
        )
    });
}

function populate_retry(state, action) {
    return Object.assign({}, state, {
        retry: (state.retry || []).reduce(
            (current, incoming) => {
                current.push(incoming);
                return current;
            },
            [
                {
                    date: action.date,
                    callback: action.callback,
                    message: action.message
                }
            ]
        )
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

function populate_wikidata(state, action) {
    return Object.assign({}, state, {
        wikidata: Object.assign({}, state.wikidata || {}, action.data)
    });
}

function loading_done(state, action) {
    return Object.assign({}, state, {
        loading: (state.loading || []).reduce((current, incoming) => {
            if (incoming !== action.date) {
                current.push(incoming);
            }

            return current;
        }, [])
    });
}

function loading_reset(state, _action) {
    return Object.assign({}, state, {
        loading: [],
        retry: []
    });
}

function retry_done(state, action) {
    return Object.assign({}, state, {
        retry: (state.retry || []).reduce((current, incoming) => {
            if (incoming.date !== action.date) {
                current.push(incoming);
            }

            return current;
        }, [])
    });
}
