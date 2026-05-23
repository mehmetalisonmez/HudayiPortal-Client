// ──────────────────────────────────────────────
// App.tsx — Root bileşen
// Theme + Auth Provider + Router
// ──────────────────────────────────────────────

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { RouterProvider } from 'react-router-dom';
import hudayiTheme from './theme';
import { AuthProvider } from './context/AuthContext';
import router from './router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignalRProvider } from './context/SignalRContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={hudayiTheme}>
        <CssBaseline />
        <AuthProvider>
          <SignalRProvider>
            <RouterProvider router={router} />
          </SignalRProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
