'use client'

import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import { useState, createContext, useContext, useMemo, ReactNode } from 'react'

// Create a context for the theme
const ThemeContext = createContext({
  isDarkTheme: false,
  toggleTheme: () => {},
})

// Custom hook to use the theme
export const useTheme = () => useContext(ThemeContext)

export default function ClientThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkTheme, setIsDarkTheme] = useState(false)

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme)
  }

  // Create MUI theme based on dark/light mode
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkTheme ? 'dark' : 'light',
          primary: {
            main: '#3f51b5',
          },
          secondary: {
            main: '#f50057',
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                textTransform: 'none',
              },
            },
          },
        },
      }),
    [isDarkTheme]
  )

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}
