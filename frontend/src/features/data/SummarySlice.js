import { createSlice } from "@reduxjs/toolkit";

const summarySlice = createSlice({
  name: "summary",
  initialState: {},
  reducers: {
    populate(state, action) {
      state[action.payload.year] = action.payload.country_list.reduce(
        (result, country) => {
          result[country.country] = country.category_list.reduce(
            (current, category) => {
              current[category.category] = category.count;

              return current;
            },
            {}
          );

          return result;
        },
        {}
      );
    },
  },
});

export const { populate } = summarySlice.actions;

export default summarySlice.reducer;
