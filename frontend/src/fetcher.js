const BASE_URL = process.env.REACT_APP_BASE_URL || "";

export function make_populate_retry(timestamp, callback, message) {
  return {
    type: "POPULATE_RETRY",
    message: message,
    date: timestamp,
    callback: callback,
  };
}

export function make_retry_done(timestamp) {
  return {
    type: "RETRY_DONE",
    date: timestamp,
  };
}

function make_populate_anomaly_current(data) {
  return {
    type: "POPULATE_ANOMALY_CURRENT",
    data: data,
  };
}

function make_populate_anomaly_country(data) {
  return {
    type: "POPULATE_ANOMALY_COUNTRY",
    data: data,
  };
}

function make_populate_isp(data) {
  return {
    type: "POPULATE_ISP",
    data: data,
  };
}

function make_populate_category(data) {
  return {
    type: "POPULATE_CATEGORY",
    data: data,
  };
}

function make_populate_country(data) {
  return {
    type: "POPULATE_COUNTRY",
    data: data,
  };
}

function make_populate_site(data) {
  return {
    type: "POPULATE_SITE",
    data: data,
  };
}

function make_populate_site_history(data) {
  return {
    type: "POPULATE_SITE_HISTORY",
    data: data,
  };
}

function make_populate_summary(data) {
  return {
    type: "POPULATE_SUMMARY",
    data: data,
  };
}

export function anomaly_current_fetch(
  dispatch,
  begin_callback,
  done_callback,
  country
) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/anomaly/country/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          make_populate_anomaly_current({
            [country]: data.site_list.reduce((current, site) => {
              current[site.site_url] = site.as_list.reduce((_current, asn) => {
                _current[asn.as_number] = asn.measurements;
                return _current;
              }, {});
              return current;
            }, {}),
          })
        );

        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () =>
              anomaly_current_fetch(
                dispatch,
                begin_callback,
                done_callback,
                country
              ),
            "Current anomaly list fetching failed."
          )
        );
      }
    );
}

export function isp_fetch(dispatch, begin_callback, done_callback, country) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/isp/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(make_populate_isp({ [data.country]: data.isp }));
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () => isp_fetch(dispatch, begin_callback, done_callback, country),
            "ASN list fetching failed."
          )
        );
        done_callback(timestamp);
      }
    );
}

export function category_fetch(dispatch, begin_callback, done_callback) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/category`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          make_populate_category(
            data["category_list"].reduce((current, incoming) => {
              current[incoming.category_code] = incoming;
              return current;
            }, {})
          )
        );
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () => category_fetch(dispatch, begin_callback, done_callback),
            "Category list fetching failed."
          )
        );
        done_callback(timestamp);
      }
    );
}

export function country_fetch(dispatch, begin_callback, done_callback) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/country`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(make_populate_country(data["country_list"]));
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () => country_fetch(dispatch, begin_callback, done_callback),
            "Country list fetching failed."
          )
        );
        done_callback(timestamp);
      }
    );
}

export function country_history_fetch(
  dispatch,
  begin_callback,
  done_callback,
  year,
  country
) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/history/year/${year}/country/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          make_populate_anomaly_country({
            [year]: {
              [country]: data.site_list.reduce((current, site) => {
                current[site.site_url] = site.isp_list.reduce(
                  (_current, incoming) => {
                    _current[incoming.isp] = incoming.count;
                    return _current;
                  },
                  {}
                );
                return current;
              }, {}),
            },
          })
        );
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () =>
              country_history_fetch(
                dispatch,
                begin_callback,
                done_callback,
                year,
                country
              ),
            "Country history fetching failed."
          )
        );
        done_callback(timestamp);
      }
    );
}

export function site_fetch(dispatch, begin_callback, done_callback, country) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/site/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          make_populate_site({
            [country]: data.category_list.reduce((current, category) => {
              current[category.code] = category.site_list;
              return current;
            }, {}),
          })
        );
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () => site_fetch(dispatch, begin_callback, done_callback, country),
            "Site list fetching failed"
          )
        );
        done_callback(timestamp);
      }
    );
}

export function site_fetch_history(
  dispatch,
  begin_callback,
  done_callback,
  year,
  country,
  site
) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(
    `${BASE_URL}/api/history/year/${year}/country/${country}/site/?site=${site}`
  )
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          make_populate_site_history({
            [year]: {
              [country]: {
                [site]: data.history,
              },
            },
          })
        );
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () =>
              site_fetch_history(
                dispatch,
                begin_callback,
                done_callback,
                year,
                country,
                site
              ),
            "Site history fetching failed"
          )
        );
        done_callback(timestamp);
      }
    );
}

export function summary_fetch(dispatch, begin_callback, done_callback, year) {
  let timestamp = new Date();

  begin_callback(timestamp);
  fetch(`${BASE_URL}/api/summary/${year}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          make_populate_summary({
            [data.year]: data.country_list.reduce((current, country) => {
              current[country.country] = country.category_list.reduce(
                (_current, category) => {
                  _current[category.category] = category.count;
                  return _current;
                },
                {}
              );
              return current;
            }, {}),
          })
        );
        done_callback(timestamp);
      },
      () => {
        dispatch(
          make_populate_retry(
            timestamp,
            () => summary_fetch(dispatch, begin_callback, done_callback, year),
            "Summary fetch failed."
          )
        );
        done_callback(timestamp);
      }
    );
}
