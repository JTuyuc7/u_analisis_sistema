import { IRenderContent } from "@/lib/interfaces";
import { Box, Typography } from "@mui/material";

export default function RenderContent ({ title, children, titleColor }: IRenderContent)  {
  return (
    <Box sx={{ margin: '0 auto', display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Typography variant="h4" color={titleColor} className="text-xl mb-4 flex self-center">{title}</Typography>
      {children}
    </Box>
  )
}
