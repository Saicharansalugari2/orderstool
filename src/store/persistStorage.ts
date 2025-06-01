
import storage from 'redux-persist/lib/storage';

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

export default createPersistStorage();
