import Box from '@mui/material/Box';

export function Logo({ size = 28 }) {
  return <Box component="img" src="/favicon.svg" alt="Fieldbook" sx={{ width: size, height: size, display: 'block' }} />;
}
