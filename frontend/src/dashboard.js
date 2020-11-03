function populate_anomaly_country(state, action) {
  return Object.assign({}, state, {
    history: Object.assign({}, state.history || {}, action.data),
  });
}

function populate_anomaly_current(state, action) {
  return Object.assign({}, state, {
    current: Object.assign({}, state.current || {}, action.data),
  });
}

function populate_incident(state, action) {
  return Object.assign({}, state, {
    incident: Object.assign({}, state.incident || {}, action.data),
  });
}

function populate_isp(state, action) {
  return Object.assign({}, state, {
    isp: Object.assign({}, state.isp, action.data),
  });
}

function populate_site(state, action) {
  return Object.assign({}, state, {
    site: Object.assign({}, state.site || {}, action.data),
  });
}

function populate_site_history(state, action) {
  return Object.assign({}, state, {
    history_site: Object.assign({}, state.history_site || {}, action.data),
  });
}

function populate_summary(state, action) {
  return Object.assign({}, state, {
    summary: Object.assign({}, state.summary || {}, action.data),
  });
}

function populate_wikidata(state, action) {
  return Object.assign({}, state, {
    wikidata: Object.assign({}, state.wikidata || {}, action.data),
  });
}
