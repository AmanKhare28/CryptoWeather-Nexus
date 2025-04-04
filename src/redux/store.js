import { configureStore, combineReducers } from "@reduxjs/toolkit";
import preferencesReducer from "./preferencesSlice";

const rootReducer = combineReducers({
  preferences: preferencesReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // Thunk is included by default
});

export default store;
