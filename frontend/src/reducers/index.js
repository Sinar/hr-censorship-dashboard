import AggregatedReducer from "../features/data/AggregatedSlice";
import CategoryReducer from "../features/meta/CategorySlice";
import CountryReducer from "../features/meta/CountrySlice";
import ISPReducer from "../features/meta/ISPSlice";
import SiteReducer from "../features/meta/SiteSlice";
import SummaryReducer from "../features/data/SummarySlice";
import TaskReducer from "../features/ui/TaskSlice";
import { combineReducers } from "redux";

export default combineReducers({
  aggregated: AggregatedReducer,
  category: CategoryReducer,
  country: CountryReducer,
  //incident:
  isp: ISPReducer,
  task: TaskReducer,
  site: SiteReducer,
  //history_site:
  summary: SummaryReducer,
  //wikidata:
});
