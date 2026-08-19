import { createContext, useEffect, useReducer, ReactNode } from "react";
import Reducer from "./Reducer";
import { AppState, ContextValue, Theme } from "../types";

const getInitialTheme = (): Theme => {
  const saved = localStorage.getItem("theme");
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const INITIAL_STATE: AppState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  isFetching: false,
  error: false,
  theme: getInitialTheme(),
};

export const Context = createContext<ContextValue>({
  ...INITIAL_STATE,
  dispatch: () => {},
});

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
    if (state.token) {
      localStorage.setItem("token", state.token);
    } else {
      localStorage.removeItem("token");
    }
  }, [state.user, state.token]);

  useEffect(() => {
    localStorage.setItem("theme", state.theme);
    document.body.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  return (
    <Context.Provider
      value={{
        user: state.user,
        token: state.token,
        isFetching: state.isFetching,
        error: state.error,
        theme: state.theme,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};
