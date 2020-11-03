import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {},
  reducers: {
    populate(state, action) {
      return Object.assign({}, state, action.payload);
    },
  },
});

export const { populate } = categorySlice.actions;

export default categorySlice.reducer;
