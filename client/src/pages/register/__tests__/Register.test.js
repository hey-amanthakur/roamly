import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Register from "../Register";

jest.mock("axios");

const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { replace: jest.fn() };
  });

  it("renders registration form", () => {
    renderRegister();
    expect(screen.getByText("Create account")).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByText("Create Account")).toBeInTheDocument();
  });

  it("renders link to login page", () => {
    renderRegister();
    expect(screen.getByText("Sign in")).toBeInTheDocument();
  });

  it("shows error on failed registration", async () => {
    axios.post.mockRejectedValue({
      response: { data: { message: "Username already exists" } },
    });
    renderRegister();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "taken" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass123" } });
    fireEvent.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(screen.getByText("Username already exists")).toBeInTheDocument();
    });
  });

  it("redirects to login on successful registration", async () => {
    axios.post.mockResolvedValue({ data: { message: "User created" } });
    renderRegister();

    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "newuser" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "new@test.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "pass123" } });
    fireEvent.click(screen.getByText("Create Account"));

    await waitFor(() => {
      expect(window.location.replace).toHaveBeenCalledWith("/login");
    });
  });
});
