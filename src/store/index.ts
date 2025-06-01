
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import ordersReducer from '../store/ordersSlice';
import storage from 'redux-persist/lib/storage';

// Customized storage that falls back to noop storage on server
const createPersistStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return storage;
  } else {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
};

const persistConfig = {
  key: 'root',
  storage: createPersistStorage(),
  whitelist: ['orders'], 
};

const rootReducer = combineReducers({
  orders: ordersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // disabled serializable check for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
