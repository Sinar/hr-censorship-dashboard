import {
  loadingAdd,
  loadingRemove,
  retryingAdd,
  retryingRemove,
} from "../features/ui/TaskSlice";

import { populate as aggregatedPopulateList } from "../features/data/AggregatedSlice";
import { populate as categoryPopulateList } from "../features/meta/CategorySlice";
import { populate as countryPopulateList } from "../features/meta/CountrySlice";
import { populate as ispPopulateList } from "../features/meta/ISPSlice";
import { populate as sitePopulateList } from "../features/meta/SiteSlice";
import { populate as summaryPopulateList } from "../features/data/SummarySlice";

export const BASE_URL = process.env.REACT_APP_BASE_URL || "";

//export function make_populate_retry(timestamp, callback, message) {
//  return {
//    type: "POPULATE_RETRY",
//    message: message,
//    date: timestamp,
//    callback: callback,
//  };
//}
//
//export function make_retry_done(timestamp) {
//  return {
//    type: "RETRY_DONE",
//    date: timestamp,
//  };
//}
//
//function make_populate_anomaly_country(data) {
//  return {
//    type: "POPULATE_ANOMALY_COUNTRY",
//    data: data,
//  };
//}
//
//function make_populate_isp(data) {
//  return {
//    type: "POPULATE_ISP",
//    data: data,
//  };
//}
//
//function make_populate_category(data) {
//  return {
//    type: "POPULATE_CATEGORY",
//    data: data,
//  };
//}
//
//function make_populate_country(data) {
//  return {
//    type: "POPULATE_COUNTRY",
//    data: data,
//  };
//}
//
//function make_populate_site(data) {
//  return {
//    type: "POPULATE_SITE",
//    data: data,
//  };
//}
//
//function make_populate_site_history(data) {
//  return {
//    type: "POPULATE_SITE_HISTORY",
//    data: data,
//  };
//}
//
//function make_populate_summary(data) {
//  return {
//    type: "POPULATE_SUMMARY",
//    data: data,
//  };
//}

export function aggregated_fetch(dispatch, year, country) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));
  fetch(`${BASE_URL}/api/history/year/${year}/country/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        //dispatch(
        //  make_populate_anomaly_country({
        //    [year]: {
        //      [country]: data.site_list.reduce((current, site) => {
        //        current[site.site_url] = site.isp_list.reduce(
        //          (_current, incoming) => {
        //            _current[incoming.isp] = incoming.count;
        //            return _current;
        //          },
        //          {}
        //        );
        //        return current;
        //      }, {}),
        //    },
        //  })
        //);
        dispatch(aggregatedPopulateList(data));
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => aggregated_fetch(dispatch, year, country),
            name: "Country history fetching failed.",
          })
        );
        dispatch(loadingRemove(timestamp));
      }
    );
}

export function isp_fetch(dispatch, country) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));

  fetch(`${BASE_URL}/api/isp/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(ispPopulateList(data));
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => isp_fetch(dispatch, country),
            message: "ASN list fetching failed.",
          })
        );
        dispatch(loadingRemove(timestamp));
      }
    );
}

export function category_fetch(dispatch) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));

  fetch(`${BASE_URL}/api/category`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          categoryPopulateList(
            data["category_list"].reduce((current, incoming) => {
              current[incoming.category_code] = incoming;
              return current;
            }, {})
          )
        );
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => category_fetch(dispatch),
            message: "Category list fetching failed.",
          })
        );
        dispatch(loadingRemove(timestamp));
      }
    );
}

export function country_fetch(dispatch) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));

  fetch(`${BASE_URL}/api/country`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(countryPopulateList(data["country_list"]));
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            message: "Country list fetching failed",
            date: timestamp,
            callback: () => country_fetch(dispatch),
          })
        );
        dispatch(loadingRemove(timestamp));
      }
    );
}

export function site_fetch(dispatch, country) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));

  fetch(`${BASE_URL}/api/site/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(sitePopulateList(data));
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => site_fetch(dispatch, country),
            message: "Site list fetching failed",
          })
        );
        dispatch(loadingRemove(timestamp));
      }
    );
}

//export function site_fetch_history(
//  dispatch,
//  begin_callback,
//  done_callback,
//  year,
//  country,
//  site
//) {
//  let timestamp = new Date();
//
//  begin_callback(timestamp);
//  fetch(
//    `${BASE_URL}/api/history/year/${year}/country/${country}/site/?site=${site}`
//  )
//    .then((response) => response.json())
//    .then(
//      (data) => {
//        dispatch(
//          make_populate_site_history({
//            [year]: {
//              [country]: {
//                [site]: data.history,
//              },
//            },
//          })
//        );
//        done_callback(timestamp);
//      },
//      () => {
//        dispatch(
//          make_populate_retry(
//            timestamp,
//            () =>
//              site_fetch_history(
//                dispatch,
//                begin_callback,
//                done_callback,
//                year,
//                country,
//                site
//              ),
//            "Site history fetching failed"
//          )
//        );
//        done_callback(timestamp);
//      }
//    );
//}
//
export function summary_fetch(dispatch, year) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));
  fetch(`${BASE_URL}/api/summary/${year}`)
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(summaryPopulateList(data));
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => summary_fetch(dispatch, year),
            message: "Summary fetch failed.",
          })
        );
        dispatch(loadingRemove(timestamp));
      }
    );
}

export function retry_callback(dispatch, callback, timestamp) {
  dispatch(retryingRemove(timestamp));
  callback();
}
