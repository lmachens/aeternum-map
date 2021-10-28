import { useCallback, useEffect, useState } from 'react';
import { fetchJSON } from '../../utils/api';
import { notify } from '../../utils/notifications';

export type Comment = {
  _id: string;
  markerId: string;
  createdAt: Date;
  username: string;
  message: string;
};

export type MarkerFull = {
  type: string;
  position: [number, number, number];
  name?: string;
  level?: number;
  levelRange?: [number, number];
  description?: string;
  screenshotFilename?: string;
  createdAt: string;
  username?: string;
  comments?: number;
  _id: string;
};

function useMarker(markerId: string): {
  marker?: MarkerFull;
  comments?: Comment[];
  loading: boolean;
  refresh: () => Promise<void>;
} {
  const [result, setResult] = useState<
    { marker: MarkerFull; comments: Comment[] } | Record<string, never>
  >({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    return notify(
      fetchJSON<{ marker: MarkerFull; comments: Comment[] }>(
        `/api/markers/${markerId}`
      )
        .then(({ marker, comments }) =>
          setResult({
            marker,
            comments: comments.map((comment: Comment) => ({
              ...comment,
              createdAt: new Date(comment.createdAt),
            })),
          })
        )
        .finally(() => setLoading(false))
    );
  }, [markerId]);

  useEffect(() => {
    refresh();
  }, [refresh, markerId]);

  return { ...result, loading, refresh };
}

export default useMarker;
