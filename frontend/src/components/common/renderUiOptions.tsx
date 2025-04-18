import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';

interface RenderUiOptionsProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  required?: boolean;
  id?: string;
  name?: string;
}

export default function RenderUiOptions({
  value,
  onChange,
  label = 'Select Type',
  error,
  required = false,
  id = 'type-select',
  name = 'type'
}: RenderUiOptionsProps) {
  
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <FormControl 
      fullWidth 
      error={!!error} 
      required={required}
      sx={{ mb: 2 }}
    >
      <InputLabel id={`${id}-label`}>{label}</InputLabel>
      <Select
        labelId={`${id}-label`}
        id={id}
        name={name}
        value={value}
        label={label}
        onChange={handleChange}
      >
        <MenuItem value="account">Account</MenuItem>
        <MenuItem value="card">Card</MenuItem>
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
