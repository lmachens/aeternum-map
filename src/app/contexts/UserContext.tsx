import type { ReactNode } from 'react';
import { useState } from 'react';
import { createContext, useEffect, useContext } from 'react';
import type { Preset } from '../components/PresetSelect/presets';
import { fetchJSON } from '../utils/api';
import { writeError, writeWarn } from '../utils/logs';
import { notify } from '../utils/notifications';
import { usePersistentState } from '../utils/storage';
import useEventListener from '../utils/useEventListener';

export type User = {
  _id: string;
  username: string;
  hiddenMarkerIds: string[];
  createdAt: Date;
  isModerator?: boolean;
};
type UserContextValue = {
  user: User | null;
  setUsername: (name: string) => void;
  refresh: () => void;
  account: AccountDTO | null;
  logoutAccount: () => void;
  setAccount: (account: AccountDTO) => void;
  refreshAccount: () => Promise<AccountDTO | null>;
};
const UserContext = createContext<UserContextValue>({
  user: null,
  setUsername: () => undefined,
  refresh: () => undefined,
  account: null,
  logoutAccount: () => undefined,
  setAccount: () => undefined,
  refreshAccount: async () => null,
});

type UserProviderProps = {
  children: ReactNode;
};

export type AccountDTO = {
  steamId: string;
  name: string;
  sessionId: string;
  isModerator?: boolean;
  favoriteRouteIds?: string[];
  liveShareToken?: string;
  liveShareServerUrl?: string;
  presets?: Preset[];
  createdAt: Date;
};

export function UserProvider({ children }: UserProviderProps): JSX.Element {
  const [user, setUser] = usePersistentState<User | null>('user', null);
  const [username, setUsername] = useState<string | null>(null);
  const [account, setAccount] = usePersistentState<AccountDTO | null>(
    'account',
    null
  );

  const refresh = async (): Promise<void> => {
    try {
      if (!username) {
        return;
      }
      const result = await notify(
        fetchJSON('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
          }),
        })
      );
      setUser(result as User);
    } catch (error) {
      writeError(error);
    }
  };

  const refreshAccount = async (): Promise<AccountDTO | null> => {
    try {
      const account = await notify(fetchJSON<AccountDTO>(`/api/auth/account`));
      setAccount(account);
      return account;
    } catch (error) {
      writeError(error);
      return null;
    }
  };

  const logoutAccount = async () => {
    try {
      await fetchJSON<string>('/api/auth/logout');
    } catch (error) {
      // DO nothing
    } finally {
      setAccount(null);
    }
  };

  useEventListener(
    'session-expired',
    () => {
      setAccount(null);
      writeWarn('Session expired');
    },
    []
  );

  useEffect(() => {
    if (account) {
      refreshAccount();
    }
  }, []);

  useEffect(() => {
    if (username) {
      refresh();
    }
  }, [username]);
  return (
    <UserContext.Provider
      value={{
        user,
        setUsername,
        refresh,
        account,
        setAccount,
        refreshAccount,
        logoutAccount,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useAccount() {
  const { account, refreshAccount, setAccount, logoutAccount } =
    useContext(UserContext);
  return { account, refreshAccount, setAccount, logoutAccount };
}
export function useUser(): User | null {
  return useContext(UserContext).user;
}

export function useSetUser(): (name: string) => void {
  return useContext(UserContext).setUsername;
}

export function useRefreshUser(): () => void {
  return useContext(UserContext).refresh;
}
