import { createSlice } from "@reduxjs/toolkit";

const aggregatedSlice = createSlice({
  name: "aggregated",
  initialState: {},
  reducers: {
    populate(state, action) {
      if (!(action.payload.year in state)) {
        state[action.payload.year] = {};
      }

      state[action.payload.year][
        action.payload.country
      ] = action.payload.site_list.reduce((result, site) => {
        result[site.site_url] = site.isp_list.reduce((current, isp) => {
          current[isp.isp] = isp.count;

          return current;
        }, {});

        return result;
      }, {});
    },
  },
});

export const { populate } = aggregatedSlice.actions;

export default aggregatedSlice.reducer;
