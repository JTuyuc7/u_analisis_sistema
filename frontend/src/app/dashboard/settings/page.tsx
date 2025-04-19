'use client'

import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '@/lib/redux/store'
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  Divider,
  Stack
} from '@mui/material'
import {
  Language as LanguageIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Save as SaveIcon
} from '@mui/icons-material'

export default function SettingsPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [language, setLanguage] = useState('english')
  const [theme, setTheme] = useState('light')

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLanguage(event.target.value)
    // TODO: Implement language change logic
  }

  const handleThemeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTheme(event.target.value)
    // TODO: Implement theme change logic
  }

  const handleSaveSettings = () => {
    // TODO: Implement save settings logic
    console.log('Settings saved:', { language, theme })
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Settings
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Preferences
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Language Settings */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <LanguageIcon />
            <Typography variant="h6">Language</Typography>
          </Stack>
          
          <FormControl component="fieldset">
            <RadioGroup
              name="language"
              value={language}
              onChange={handleLanguageChange}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      border: language === 'english' ? 2 : 1,
                      borderColor: language === 'english' ? 'primary.main' : 'divider',
                      bgcolor: language === 'english' ? 'action.hover' : 'background.paper'
                    }}
                  >
                    <CardContent>
                      <FormControlLabel 
                        value="english" 
                        control={<Radio />} 
                        label={
                          <Box>
                            <Typography variant="subtitle1">English</Typography>
                            <Typography variant="body2" color="text.secondary">English (United States)</Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      border: language === 'spanish' ? 2 : 1,
                      borderColor: language === 'spanish' ? 'primary.main' : 'divider',
                      bgcolor: language === 'spanish' ? 'action.hover' : 'background.paper'
                    }}
                  >
                    <CardContent>
                      <FormControlLabel 
                        value="spanish" 
                        control={<Radio />} 
                        label={
                          <Box>
                            <Typography variant="subtitle1">Español</Typography>
                            <Typography variant="body2" color="text.secondary">Spanish (Latin America)</Typography>
                          </Box>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Theme Settings */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            {theme === 'light' ? <LightModeIcon /> : <DarkModeIcon />}
            <Typography variant="h6">Theme</Typography>
          </Stack>
          
          <FormControl component="fieldset">
            <RadioGroup
              name="theme"
              value={theme}
              onChange={handleThemeChange}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      border: theme === 'light' ? 2 : 1,
                      borderColor: theme === 'light' ? 'primary.main' : 'divider',
                      bgcolor: theme === 'light' ? 'action.hover' : 'background.paper'
                    }}
                  >
                    <CardContent>
                      <FormControlLabel 
                        value="light" 
                        control={<Radio />} 
                        label={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <LightModeIcon sx={{ color: 'warning.main' }} />
                            <Box>
                              <Typography variant="subtitle1">Light</Typography>
                              <Typography variant="body2" color="text.secondary">Default light theme</Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined"
                    sx={{ 
                      border: theme === 'dark' ? 2 : 1,
                      borderColor: theme === 'dark' ? 'primary.main' : 'divider',
                      bgcolor: theme === 'dark' ? 'action.hover' : 'background.paper'
                    }}
                  >
                    <CardContent>
                      <FormControlLabel 
                        value="dark" 
                        control={<Radio />} 
                        label={
                          <Stack direction="row" spacing={2} alignItems="center">
                            <DarkModeIcon sx={{ color: 'primary.dark' }} />
                            <Box>
                              <Typography variant="subtitle1">Dark</Typography>
                              <Typography variant="body2" color="text.secondary">Dark mode for low light</Typography>
                            </Box>
                          </Stack>
                        }
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </RadioGroup>
          </FormControl>
        </Box>
      </Paper>
      
      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<SaveIcon />}
          onClick={handleSaveSettings}
        >
          Save Preferences
        </Button>
      </Box>
    </Box>
  )
}
