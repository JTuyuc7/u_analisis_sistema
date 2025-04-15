'use client'

import { ReactNode } from 'react'
import { Stack, Typography, Box } from '@mui/material'

interface DefaultContentPageProps {
  icon?: ReactNode
  text: string
  children?: ReactNode
  iconSize?: number
  textVariant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2'
}

export default function DefaultContentPage({
  icon,
  text,
  children,
  iconSize = 48,
  textVariant = 'h6'
}: DefaultContentPageProps) {
  return (
    <Stack
      spacing={3}
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: '200px',
        width: '100%',
        padding: 3,
        textAlign: 'center'
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: iconSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& > *': {
              fontSize: 'inherit'
            }
          }}
        >
          {icon}
        </Box>
      )}
      <Typography variant={textVariant} component="div">
        {text}
      </Typography>
      {children && (
        <Box sx={{ width: '100%', mt: 2 }}>
          {children}
        </Box>
      )}
    </Stack>
  )
}
