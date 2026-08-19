import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import LocationInput from "../LocationInput";

describe("LocationInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the location input", () => {
    render(<LocationInput location={{}} onChange={mockOnChange} />);
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Where was this taken?")).toBeInTheDocument();
  });

  it("shows preset locations on button click", () => {
    render(<LocationInput location={{}} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
    expect(screen.getByText("Tokyo, Japan")).toBeInTheDocument();
  });

  it("calls onChange when a preset is selected", () => {
    render(<LocationInput location={{}} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.mouseDown(screen.getByText("Paris, France"));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Paris, France" })
    );
  });

  it("calls onChange on custom input", () => {
    render(<LocationInput location={{}} onChange={mockOnChange} />);
    fireEvent.change(screen.getByPlaceholderText("Where was this taken?"), {
      target: { value: "Custom Place" },
    });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Custom Place" })
    );
  });

  it("shows location preview when location has a name", () => {
    render(
      <LocationInput
        location={{ name: "Paris, France" }}
        onChange={mockOnChange}
      />
    );
    expect(screen.getByText("Paris, France")).toBeInTheDocument();
  });
});
