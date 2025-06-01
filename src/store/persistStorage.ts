// store/persistStorage.ts
import storage from 'redux-persist/lib/storage';

// Only use localStorage if window is defined (i.e., client)
const createPersistStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return storage;
  } else {
    // fallback noop storage for SSR
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
};

export default createPersistStorage();
