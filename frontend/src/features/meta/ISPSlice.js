import { createSlice } from "@reduxjs/toolkit";

const ispSlice = createSlice({
  name: "isp",
  initialState: {},
  reducers: {
    blah(state, action) {
      state["foo"] = "bar";
    },
  },
});

export const { blah } = ispSlice.actions;

export default ispSlice.reducer;
