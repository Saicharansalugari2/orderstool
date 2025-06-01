// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers } from 'redux';
import ordersReducer from '../store/ordersSlice';
import storage from 'redux-persist/lib/storage';

// Custom storage that falls back to noop storage on server
const createPersistStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return storage;
  } else {
    // Noop storage for SSR (server side)
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
  whitelist: ['orders'], // persist only orders slice
};

const rootReducer = combineReducers({
  orders: ordersReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false, // disable serializable check for redux-persist
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
