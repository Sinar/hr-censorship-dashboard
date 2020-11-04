import AggregatedReducer from "../features/data/AggregatedSlice";
import CategoryReducer from "../features/meta/CategorySlice";
import CountryReducer from "../features/meta/CountrySlice";
import ISPReducer from "../features/meta/ISPSlice";
import IncidentReducer from "../features/data/IncidentSlice";
import MeasurementReducer from "../features/data/MeasurementSlice";
import SiteReducer from "../features/meta/SiteSlice";
import SummaryReducer from "../features/data/SummarySlice";
import TaskReducer from "../features/ui/TaskSlice";
import WikidataReducer from "../features/data/WikidataSlice";
import { combineReducers } from "redux";

export default combineReducers({
  aggregated: AggregatedReducer,
  category: CategoryReducer,
  country: CountryReducer,
  incident: IncidentReducer,
  isp: ISPReducer,
  task: TaskReducer,
  site: SiteReducer,
  measurement: MeasurementReducer,
  summary: SummaryReducer,
  wikidata: WikidataReducer,
});
