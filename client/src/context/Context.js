import { createContext, useEffect, useReducer } from "react";
import Reducer from "./Reducer";

const getInitialTheme = () => {
  const saved = localStorage.getItem("theme");
  if (saved) return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  isFetching: false,
  error: false,
  theme: getInitialTheme(),
};

export const Context = createContext(INITIAL_STATE);

export const ContextProvider = ({ children }) => {
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
