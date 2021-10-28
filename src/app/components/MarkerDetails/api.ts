import { fetchJSON } from '../../utils/api';

export function patchUser(username: string, hiddenMarkerIds: string[]) {
  return fetchJSON(`/api/users/${username}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      hiddenMarkerIds,
    }),
  });
}

export function patchMarker(
  markerId: string,
  screenshotId: string,
  userId?: string
) {
  return fetchJSON<string>(`/api/markers/${markerId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      screenshotId,
      userId,
    }),
  });
}

export function deleteMarker(markerId: string, userId: string) {
  return fetchJSON(`/api/markers/${markerId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
    }),
  });
}
