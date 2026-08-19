import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Login from "../Login";
import { Context } from "../../../context/Context";

jest.mock("axios");

const mockDispatch = jest.fn();
const renderLogin = (contextValue = {}) => {
  const defaultContext = {
    dispatch: mockDispatch,
    isFetching: false,
    user: null,
    token: null,
    theme: "light",
    ...contextValue,
  };
  return render(
    <MemoryRouter>
      <Context.Provider value={defaultContext}>
        <Login />
      </Context.Provider>
    </MemoryRouter>
  );
};

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form", () => {
    renderLogin();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Sign In")).toBeInTheDocument();
  });

  it("renders link to register page", () => {
    renderLogin();
    expect(screen.getByText("Create one")).toBeInTheDocument();
  });

  it("shows error message on failed login", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Wrong credentials!" } },
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "user" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass" } });
    fireEvent.click(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(screen.getByText("Wrong credentials!")).toBeInTheDocument();
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGIN_START" });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGIN_FAILURE" });
  });

  it("dispatches LOGIN_SUCCESS on successful login", async () => {
    axios.post.mockResolvedValue({
      data: { _id: "1", username: "testuser", token: "abc123" },
    });
    renderLogin();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "testuser" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByText("Sign In"));

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({
        type: "LOGIN_SUCCESS",
        payload: { user: { _id: "1", username: "testuser" }, token: "abc123" },
      });
    });
  });
});
