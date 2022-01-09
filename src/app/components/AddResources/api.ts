import type { MarkerBasic } from '../../contexts/MarkersContext';
import { fetchJSON } from '../../utils/api';

export type MarkerDTO = {
  _id?: string;
  type: string;
  map?: string;
  position: [number, number, number];
  name?: string;
  level?: number;
  chestType?: string;
  tier?: number;
  description?: string;
  screenshotId?: string;
};

export function postMarker(marker: MarkerDTO) {
  return fetchJSON<MarkerBasic>('/api/markers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(marker),
  });
}

export function patchMarker(id: string, marker: Partial<MarkerDTO>) {
  return fetchJSON<MarkerBasic>(`/api/markers/${id}`, {
    method: 'PATCH',
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
