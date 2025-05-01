import { ThemeProvider, CssBaseline, createTheme } from '@mui/material';
import '@fontsource/roboto';

const theme = createTheme();

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
} 