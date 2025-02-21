import ReactDOM from 'react-dom/client';
import { Suspense, StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useAuth, AuthKitProvider } from '@workos-inc/authkit-react';

import App from './app';

// ----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

const VITE_WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID;

root.render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthKitProvider clientId={VITE_WORKOS_CLIENT_ID} apiHostname="auth.foo-corp.com">
          <Suspense>
            <App />
          </Suspense>
        </AuthKitProvider>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>
);
