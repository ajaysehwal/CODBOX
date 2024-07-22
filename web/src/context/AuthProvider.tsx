"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
  AuthError,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isAuth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setloading] = useState<boolean>(true);
  const [isAuth, setIsAuth] = useState<boolean>(false);
  const [authState, setAuthState] = useState<{
    user: User | null;
    error: AuthError | null;
  }>({
    user: null,
    error: null,
  });

  const googleAuth = new GoogleAuthProvider();

  const login = async () => {
    try {
      const result = await signInWithPopup(auth, googleAuth);
      console.log(result);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        user,
        error: null,
      });
    });
    if (authState.user) {
      setIsAuth(true);
    }
    return () => unsubscribe();
  }, [authState.user, isAuth]);

  useEffect(() => {
    const isAuthenticated = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      setloading(false);
    };
    isAuthenticated();
  }, []);
  return (
    <AuthContext.Provider
      value={{ ...authState, login, logout, loading, isAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
