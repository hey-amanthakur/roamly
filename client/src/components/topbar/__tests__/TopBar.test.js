import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TopBar from "../TopBar";
import { Context } from "../../../context/Context";

const mockDispatch = jest.fn();
const mockHistory = { push: jest.fn() };

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useHistory: () => mockHistory,
}));

const renderTopBar = (contextValue = {}) => {
  const defaultContext = {
    user: null,
    dispatch: mockDispatch,
    theme: "light",
    token: null,
    ...contextValue,
  };
  return render(
    <MemoryRouter>
      <Context.Provider value={defaultContext}>
        <TopBar />
      </Context.Provider>
    </MemoryRouter>
  );
};

describe("TopBar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders logo", () => {
    renderTopBar();
    expect(screen.getByText("wanderlog")).toBeInTheDocument();
  });

  it("renders Home and Trending links for logged out users", () => {
    renderTopBar();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByText("REGISTER")).toBeInTheDocument();
  });

  it("renders Write, Bookmarks, Dashboard for logged in users", () => {
    renderTopBar({ user: { username: "test", profilePic: "" }, token: "abc" });
    expect(screen.getByText("Write")).toBeInTheDocument();
    expect(screen.getByText("Bookmarks")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("calls dispatch LOGOUT when Logout is clicked", () => {
    renderTopBar({ user: { username: "test" }, token: "abc" });
    fireEvent.click(screen.getByText("Logout"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGOUT" });
  });

  it("toggles theme on theme button click", () => {
    renderTopBar();
    fireEvent.click(screen.getByTitle("Toggle theme"));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "TOGGLE_THEME" });
  });

  it("search form submits and navigates", () => {
    renderTopBar();
    fireEvent.change(screen.getByPlaceholderText("Search..."), {
      target: { value: "travel" },
    });
    fireEvent.submit(screen.getByPlaceholderText("Search...").closest("form"));
    expect(mockHistory.push).toHaveBeenCalledWith("/?search=travel");
  });
});
