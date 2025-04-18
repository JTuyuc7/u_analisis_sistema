import { IRenderContent } from "@/lib/interfaces";
import { Box } from "@mui/material";

export default function RenderContent ({ title, children }: IRenderContent)  {
  return (
    <Box sx={{ margin: '0 auto', display: 'flex', flexDirection: 'column', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <h2 className="text-xl mb-4 flex self-center">{title}</h2>
      {children}
    </Box>
  )
}
