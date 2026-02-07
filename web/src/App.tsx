import { QueryClientProvider } from '@tanstack/react-query'
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material'
import { queryClient } from 'common/queryClient'
import AppRouter from 'routes/AppRouter'

const theme = createTheme({
  typography: {
    fontFamily: ['DM Sans', 'sans-serif'].join(',')
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
