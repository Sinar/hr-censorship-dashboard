import { createSlice } from "@reduxjs/toolkit";

const countrySlice = createSlice({
  name: "country",
  initialState: [],
  reducers: {
    populate(_state, action) {
      return action.payload;
    },
  },
});

export const { populate } = countrySlice.actions;

export default countrySlice.reducer;
