import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import Layout from '../components/Layout';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { rehydrateOrders } from '@/store/ordersSlice';

import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const RehydrateWrapper = () => {
    const dispatch = useAppDispatch();

    useEffect(() => {
      dispatch(rehydrateOrders());
    }, [dispatch]);

    return <Component {...pageProps} />;
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="bg-black min-h-screen text-white font-balthazar">
            <Layout>
              <RehydrateWrapper />
            </Layout>
          </div>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
