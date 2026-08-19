import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SideBar from "../SideBar";

describe("SideBar", () => {
  it("renders author info", () => {
    render(<SideBar />);
    expect(screen.getByText("Aman Thakur")).toBeInTheDocument();
    expect(screen.getByText(/Full-stack developer/)).toBeInTheDocument();
  });

  it("renders social links", () => {
    render(<SideBar />);
    expect(screen.getByLabelText("GitHub")).toBeInTheDocument();
    expect(screen.getByLabelText("Twitter")).toBeInTheDocument();
    expect(screen.getByLabelText("LinkedIn")).toBeInTheDocument();
    expect(screen.getByLabelText("Instagram")).toBeInTheDocument();
  });

  it("renders newsletter section", () => {
    render(<SideBar />);
    expect(screen.getByText("Newsletter")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@email.com")).toBeInTheDocument();
  });

  it("shows subscribed message after form submission", () => {
    render(<SideBar />);
    fireEvent.change(screen.getByPlaceholderText("you@email.com"), {
      target: { value: "test@test.com" },
    });
    fireEvent.click(screen.getByRole("button", { type: "submit" }));
    expect(screen.getByText("Subscribed!")).toBeInTheDocument();
  });
});
