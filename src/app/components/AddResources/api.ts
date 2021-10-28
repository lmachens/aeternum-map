import { fetchJSON } from '../../utils/api';

export type MarkerDTO = {
  type: string;
  position: [number, number, number];
  name?: string;
  level?: number;
  description?: string;
  levelRange?: [number, number];
  username: string;
  screenshotId?: string;
};

export function postMarker(marker: MarkerDTO) {
  return fetchJSON('/api/markers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(marker),
  });
}

export function uploadScreenshot(blob: Blob) {
  const formData = new FormData();
  formData.append('screenshot', blob);

  return fetchJSON<{ screenshotId: string }>('/api/screenshots', {
    method: 'POST',
    body: formData,
  });
}
