import { createSlice } from "@reduxjs/toolkit";

const measurementSlice = createSlice({
  name: "measurement",
  initialState: {},
  reducers: {
    populate(state, action) {
      if (!(action.payload.year in state)) {
        state[action.payload.year] = {};
      }

      if (!(action.payload.country in state?.[action.payload.year])) {
        state[action.payload.year][action.payload.country] = {};
      }

      state[action.payload.year][action.payload.country][
        action.payload.site
      ] = action.payload.data.reduce((current, incoming) => {
        let asn = incoming.probe_asn.replace("AS", "");

        if (!(asn in current)) {
          current[asn] = [];
        }

        current[asn].push(incoming);

        return current;
      }, {});
    },
  },
});

export const { populate } = measurementSlice.actions;

export default measurementSlice.reducer;
