import { createSlice } from "@reduxjs/toolkit";

const taskSlice = createSlice({
  name: "task",
  initialState: {
    loading: [],
    retrying: [],
  },
  reducers: {
    loadingAdd(state, action) {
      return Object.assign({}, state, {
        loading: state.loading.reduce(
          (current, incoming) => {
            current.push(incoming);
            return current;
          },
          [action.payload]
        ),
      });
    },
    loadingRemove(state, action) {
      return Object.assign({}, state, {
        loading: state.loading.reduce((current, incoming) => {
          if (incoming !== action.payload) {
            current.push(incoming);
          }

          return current;
        }, []),
      });
    },
    reset(_state, _action) {
      return {
        loading: [],
        retrying: [],
      };
    },
    retryingAdd(state, action) {
      return Object.assign({}, state, {
        retrying: state.retrying.reduce(
          (current, incoming) => {
            current.push(incoming);
            return current;
          },
          [action.payload]
        ),
      });
    },
    retryingRemove(state, action) {
      return Object.assign({}, state, {
        retrying: state.retrying.reduce((current, incoming) => {
          if (incoming.date !== action.payload) {
            current.push(incoming);
          }

          return current;
        }, []),
      });
    },
  },
});

export const {
  loadingAdd,
  loadingRemove,
  reset,
  retryingAdd,
  retryingRemove,
} = taskSlice.actions;

export default taskSlice.reducer;
