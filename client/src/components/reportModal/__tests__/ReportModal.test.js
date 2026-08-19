import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import ReportModal from "../ReportModal";

jest.mock("axios");

describe("ReportModal", () => {
  const defaultProps = {
    targetType: "post",
    targetId: "post123",
    token: "test-token",
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the report modal", () => {
    render(<ReportModal {...defaultProps} />);
    expect(screen.getByText("Report post")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Submit Report")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    render(<ReportModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows error when no reason selected", async () => {
    render(<ReportModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Submit Report"));
    expect(await screen.findByText("Please select a reason")).toBeInTheDocument();
  });

  it("submits report successfully", async () => {
    axios.post.mockResolvedValue({ data: { message: "Report submitted" } });
    render(<ReportModal {...defaultProps} />);

    fireEvent.change(screen.getByDisplayValue("Select a reason..."), {
      target: { value: "spam" },
    });
    fireEvent.click(screen.getByText("Submit Report"));

    await waitFor(() => {
      expect(screen.getByText("Thank you for your report. We will review it shortly.")).toBeInTheDocument();
    });
  });

  it("calls onClose when close button is clicked after submission", async () => {
    axios.post.mockResolvedValue({ data: { message: "Report submitted" } });
    render(<ReportModal {...defaultProps} />);

    fireEvent.change(screen.getByDisplayValue("Select a reason..."), {
      target: { value: "spam" },
    });
    fireEvent.click(screen.getByText("Submit Report"));

    await waitFor(() => {
      fireEvent.click(screen.getByText("Close"));
    });
    expect(defaultProps.onClose).toHaveBeenCalled();
  });
});
