function populate_incident(state, action) {
  return Object.assign({}, state, {
    incident: Object.assign({}, state.incident || {}, action.data),
  });
}

function populate_site_history(state, action) {
  return Object.assign({}, state, {
    history_site: Object.assign({}, state.history_site || {}, action.data),
  });
}

function populate_wikidata(state, action) {
  return Object.assign({}, state, {
    wikidata: Object.assign({}, state.wikidata || {}, action.data),
  });
}
