import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum AppLocations {
  Home = "",
  BechConverter = "bechConverter",
  MsgSignVerify = "msgSignVerify"
}

export interface AppState {
  appLocation: AppLocations
}

const initialState: AppState = {
  appLocation: AppLocations.Home,
};

export const appSlice = createSlice({
  name: "appState",
  initialState,
  reducers: {
    changeAppLocation: (state, action: PayloadAction<AppLocations>) => {
      state.appLocation = action.payload;
    },
  },
});

export const { changeAppLocation } = appSlice.actions;

export default appSlice.reducer;
