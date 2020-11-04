import { createSlice } from "@reduxjs/toolkit";

const wikidataSlice = createSlice({
  name: "isp",
  initialState: {},
  reducers: {
    populate(state, action) {
      if (!(action.payload.country in state)) {
        state[action.payload.country] = {};
      }

      state[action.payload.country][
        action.payload.date
      ] = action.payload.data?.results?.bindings?.map((incoming) => ({
        link: incoming.event.value,
        label: incoming.eventLabel.value,
      }));
    },
  },
});

export const { populate } = wikidataSlice.actions;

export default wikidataSlice.reducer;
