import CategoryReducer from "../features/meta/CategorySlice";
import CountryReducer from "../features/meta/CountrySlice";
import ISPReducer from "../features/meta/ISPSlice";
import SummaryReducer from "../features/data/SummarySlice";
import TaskReducer from "../features/ui/TaskSlice";
import { combineReducers } from "redux";

export default combineReducers({
  //?????history:
  category: CategoryReducer,
  country: CountryReducer,
  //incident:
  isp: ISPReducer,
  task: TaskReducer,
  //site:
  //history_site:
  summary: SummaryReducer,
  //wikidata:
});
