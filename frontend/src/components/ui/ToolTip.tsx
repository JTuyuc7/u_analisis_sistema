import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import HelpIcon from '@mui/icons-material/Help';

interface ToolTipProps { 
  title: string;
}

export default function ToolTipComponent({ title }: ToolTipProps) {
  return (
    <Tooltip title={title}>
      <IconButton>
        <HelpIcon />
      </IconButton>
    </Tooltip>
  );
}