import type { DependencyList } from 'react';
import { useEffect } from 'react';

function useEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  deps: DependencyList
) {
  useEffect(() => {
    window.addEventListener(type, listener);

    return () => {
      window.removeEventListener(type, listener);
    };
  }, deps);
}

export default useEventListener;
