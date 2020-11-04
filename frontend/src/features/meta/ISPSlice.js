import { createSlice } from "@reduxjs/toolkit";

const ispSlice = createSlice({
  name: "isp",
  initialState: {},
  reducers: {
    populate(state, action) {
      state[action.payload.country] = action.payload.isp;
    },
  },
});

export const { populate } = ispSlice.actions;

export default ispSlice.reducer;
