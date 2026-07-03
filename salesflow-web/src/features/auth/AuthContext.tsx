import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  getAuthToken,
  removeAuthToken,
  setAuthToken,
} from "../../lib/authStorage";
import { getMeApi, loginApi, logoutApi } from "./authApi";
import type { LoginPayload, User } from "./authType";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentToken = getAuthToken();

    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getMeApi();

      setUser(response.data.user);
      setTokenState(currentToken);
    } catch {
      removeAuthToken();
      setUser(null);
      setTokenState(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = async (payload: LoginPayload) => {
    const response = await loginApi(payload);

    setAuthToken(response.data.token);
    setTokenState(response.data.token);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      removeAuthToken();
      setTokenState(null);
      setUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
      refreshUser,
    };
  }, [user, token, isLoading, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
