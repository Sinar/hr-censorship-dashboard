const initial_state = {
    current: {
        type: 'CURRENT_INACCESSIBLE',
        country: 'my'
    },
    data: []
};

export default function dashboardApp(state = initial_state, action) {
    let result;

    switch (action.type) {
        case 'POPULATE_DATA':
            result = populate(state, action);
            break;
        case 'GO_CURRENT_INACCESSIBLE':
        case 'GO_MONITORED_LIST':
        case 'GO_DOWNTIME_HISTORY':
        case 'GO_DOWNTIME_SUMMARY':
            result = navigate(state, action);
            break;
        default:
            result = Object.assign({}, state);
    }

    return result;
}

function navigate(state, action) {
    return Object.assign({}, state, {
        current: Object.assign({}, action.param)
    });
}

function populate(state, action) {
    return Object.assign({}, state, {
        data: action.data
    });
}
