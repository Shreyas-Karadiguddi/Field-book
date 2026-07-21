import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import { fetchVisitPhotoUrl } from '@/api/visits-api';

export function VisitPhoto({ visitId, sx }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let objectUrl;
    let cancelled = false;

    fetchVisitPhotoUrl(visitId).then((resolvedUrl) => {
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
  }, [visitId]);

  if (!url) return null;

  return (
    <Box
      component="img"
      src={url}
      alt="Visit"
      sx={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 1, display: 'block', ...sx }}
    />
  );
}
