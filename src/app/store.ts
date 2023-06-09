import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import appReducer from "../features/app/appSlice";
import accountsReducer from "../features/accounts/accountsSlice";
import connectionReducer from "../features/connection/connectionSlice";
import messagesReducer from "../features/messages/messagesSlice";
import consoleReducer from "../features/console/consoleSlice";
import toolboxReducer from "../features/console/toolboxSlice";
import signingReducer from "../features/tools/signingSlice";

const persistConfig = {
  key: "root",
  storage,
};

const reducer = persistReducer(
  persistConfig,
  combineReducers({
    appState: appReducer,
    accounts: accountsReducer,
    connection: connectionReducer,
    messages: messagesReducer,
    console: consoleReducer,
    toolbox: toolboxReducer,
    signing: signingReducer
  })
);

export const store = configureStore({
  reducer,
  middleware: (mw) => mw({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
