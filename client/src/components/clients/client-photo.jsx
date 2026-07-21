import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { fetchClientPhotoUrl } from '@/api/clients-api';

export function ClientPhoto({ clientId, sx }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    fetchClientPhotoUrl(clientId).then((resolvedUrl) => {
      if (cancelled) {
        URL.revokeObjectURL(resolvedUrl);
        return;
      }
      objectUrl = resolvedUrl;
      setUrl(resolvedUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [clientId]);

  if (!url) return null;

  return (
    <Box
      component="img"
      src={url}
      alt="Shop"
      sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1, display: 'block', ...sx }}
    />
  );
}
