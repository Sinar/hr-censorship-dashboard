import {
  loadingAdd,
  loadingRemove,
  retryingAdd,
  retryingRemove,
} from "../features/ui/TaskSlice";

import { populate as aggregatedPopulateList } from "../features/data/AggregatedSlice";
import { populate as categoryPopulateList } from "../features/meta/CategorySlice";
import { populate as countryPopulateList } from "../features/meta/CountrySlice";
import { populate as incidentPopulateList } from "../features/data/IncidentSlice";
import { populate as ispPopulateList } from "../features/meta/ISPSlice";
import { populate as measurementPopulateList } from "../features/data/MeasurementSlice";
import { populate as sitePopulateList } from "../features/meta/SiteSlice";
import { populate as summaryPopulateList } from "../features/data/SummarySlice";
import { populate as wikidataPopulateList } from "../features/data/WikidataSlice";

export const BASE_URL = process.env.REACT_APP_BASE_URL || "";

export function aggregated_fetch(dispatch, year, country) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));
  fetch(`${BASE_URL}/api/history/year/${year}/country/${country}`)
    .then((response) => response.json())
    .then(
      (data) => {
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

export function incident_fetch(dispatch, report_id, site) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));

  fetch(
    `https://api.ooni.io/api/v1/raw_measurement?report_id=${report_id}&input=${site}`
  )
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          incidentPopulateList({
            data: data,
            report_id: report_id,
            site: site,
          })
        );
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => incident_fetch(dispatch, report_id, site),
            message: "Measurement fetching failed.",
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

export function measurement_fetch(dispatch, year, country, site) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));
  fetch(
    year < 2020
      ? `${BASE_URL}/api/history/year/${year}/country/${country}/site/?site=${site}`
      : `https://api.ooni.io/api/v1/measurements?input=${site}&since=${year}-01-01&until=${year}-12-31&probe_cc=${country}&order_by=measurement_start_time&order=desc&limit=100&anomaly=true`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Unable to fetch");
      }

      return response.json();
    })
    .then((data) => {
      dispatch(
        measurementPopulateList({
          year: year,
          country: country,
          site: site,
          data: data.results || [],
        })
      );
      dispatch(loadingRemove(timestamp));
    })
    .catch(() => {
      console.log("retry");
      dispatch(
        retryingAdd({
          date: timestamp,
          callback: () => measurement_fetch(dispatch, year, country, site),
          message: "Site history fetching failed",
        })
      );
      dispatch(loadingRemove(timestamp));
    });
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

export function wikidata_fetch(dispatch, country, date) {
  let timestamp = new Date().toJSON();

  dispatch(loadingAdd(timestamp));

  fetch(
    `https://query.wikidata.org/sparql?query=PREFIX%20xsd%3A%20%3Chttp%3A%2F%2Fwww.w3.org%2F2001%2FXMLSchema%23%3E%0A%0ASELECT%20%3Fevent%20%3FeventLabel%20%3FcountryCode%20%3Fdate%20WHERE%20%7B%0A%20%20%3Fevent%20(wdt%3AP31%2Fwdt%3AP279*)%20wd%3AQ1190554.%0A%20%20%7B%20%3Fevent%20wdt%3AP585%20%3Fdate.%20%7D%20UNION%20%7B%20%3Fevent%20wdt%3AP580%20%3Fdate.%20%7D%0A%20%20%3Fevent%20rdfs%3Alabel%20%3FeventLabel.%0A%20%20%3Fevent%20wdt%3AP17%20%3Fcountry.%0A%20%20%3Fcountry%20wdt%3AP297%20%3FcountryCode.%0A%20%20FILTER(%3Fdate%20%3D%20%22${date}%22%5E%5Exsd%3AdateTime)%0A%20%20FILTER(%3FcountryCode%20%3D%20%22${country.toUpperCase()}%22)%0A%7D%0ALIMIT%2010`,
    {
      headers: {
        Accept: "application/sparql-results+json",
      },
    }
  )
    .then((response) => response.json())
    .then(
      (data) => {
        dispatch(
          wikidataPopulateList({
            country: country,
            date: date,
            data: data,
          })
        );
        //dispatch(
        //  make_populate_wikidata({
        //    [this.incident_get_country()]: {
        //      [this.incident_get_date()]: (
        //        (data.results || {}).bindings || []
        //      ).map((incoming) => ({
        //        link: incoming.event.value,
        //        label: incoming.eventLabel.value,
        //      })),
        //    },
        //  })
        //);
        dispatch(loadingRemove(timestamp));
      },
      () => {
        dispatch(
          retryingAdd({
            date: timestamp,
            callback: () => wikidata_fetch(dispatch, country, date),
            message: "Wikidata fetching failed.",
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
