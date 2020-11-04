import { createSlice } from "@reduxjs/toolkit";

const siteSlice = createSlice({
  name: "site",
  initialState: {},
  reducers: {
    populate(state, action) {
      state[action.payload.country] = action.payload.category_list.reduce(
        (result, category) => {
          result[category.code] = category.site_list;

          return result;
        },
        {}
      );
    },
  },
});

export const { populate } = siteSlice.actions;

export default siteSlice.reducer;
