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

const App = () => {
  return (
    <ThemeProvider theme={hudayiTheme}>
      <CssBaseline />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
