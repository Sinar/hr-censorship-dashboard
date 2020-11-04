import { createSlice } from "@reduxjs/toolkit";

const incidentSlice = createSlice({
  name: "incident",
  initialState: {},
  reducers: {
    populate(state, action) {
      if (!(action.payload.report_id in state)) {
        state[action.payload.report_id] = {};
      }

      state[action.payload.report_id][action.payload.site] =
        action.payload.data;
    },
  },
});

export const { populate } = incidentSlice.actions;

export default incidentSlice.reducer;
