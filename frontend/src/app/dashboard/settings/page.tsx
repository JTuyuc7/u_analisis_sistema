'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack
} from '@mui/material'
import {
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Translate as TranslateIcon
} from '@mui/icons-material'

export default function SettingsPage() {
  const [language, setLanguage] = useState('english')
  const [theme, setTheme] = useState('light')

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value)
    // In a real app, you would dispatch an action to update the language in your state management
  }

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value)
    // In a real app, you would dispatch an action to update the theme in your state management
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Settings
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Customize your application preferences.
      </Typography>

      {/* Language Settings */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <LanguageIcon color="primary" fontSize="large" />
          <Typography variant="h6">Language Settings</Typography>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ mb: 2 }}>Select your preferred language</FormLabel>
          <RadioGroup
            name="language-options"
            value={language}
            onChange={handleLanguageChange}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    border: language === 'english' ? 2 : 1,
                    borderColor: language === 'english' ? 'primary.main' : 'divider'
                  }}
                >
                  <CardContent>
                    <FormControlLabel 
                      value="english" 
                      control={<Radio />} 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LanguageIcon color="primary" />
                          <Typography>English</Typography>
                        </Stack>
                      } 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    border: language === 'spanish' ? 2 : 1,
                    borderColor: language === 'spanish' ? 'primary.main' : 'divider'
                  }}
                >
                  <CardContent>
                    <FormControlLabel 
                      value="spanish" 
                      control={<Radio />} 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <TranslateIcon color="primary" />
                          <Typography>Spanish</Typography>
                        </Stack>
                      } 
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </RadioGroup>
        </FormControl>
      </Paper>

      {/* Theme Settings */}
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          {theme === 'dark' ? 
            <DarkModeIcon color="primary" fontSize="large" /> : 
            <LightModeIcon color="primary" fontSize="large" />
          }
          <Typography variant="h6">Theme Settings</Typography>
        </Stack>
        <Divider sx={{ mb: 3 }} />

        <FormControl component="fieldset">
          <FormLabel component="legend" sx={{ mb: 2 }}>Select your preferred theme</FormLabel>
          <RadioGroup
            name="theme-options"
            value={theme}
            onChange={handleThemeChange}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    border: theme === 'light' ? 2 : 1,
                    borderColor: theme === 'light' ? 'primary.main' : 'divider',
                    bgcolor: 'background.paper'
                  }}
                >
                  <CardContent>
                    <FormControlLabel 
                      value="light" 
                      control={<Radio />} 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LightModeIcon />
                          <Typography>Light Theme</Typography>
                        </Stack>
                      } 
                    />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    p: 1, 
                    border: theme === 'dark' ? 2 : 1,
                    borderColor: theme === 'dark' ? 'primary.main' : 'divider',
                    bgcolor: 'grey.900',
                    color: 'white'
                  }}
                >
                  <CardContent>
                    <FormControlLabel 
                      value="dark" 
                      control={<Radio sx={{ color: 'white', '&.Mui-checked': { color: 'primary.light' } }} />} 
                      label={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DarkModeIcon sx={{ color: 'white' }} />
                          <Typography sx={{ color: 'white' }}>Dark Theme</Typography>
                        </Stack>
                      } 
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </RadioGroup>
        </FormControl>
      </Paper>
    </Box>
  )
}
