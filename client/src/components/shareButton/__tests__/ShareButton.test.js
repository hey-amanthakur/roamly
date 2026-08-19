import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ShareButton from "../ShareButton";

describe("ShareButton", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "share", { value: undefined, writable: true });
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      writable: true,
    });
  });

  it("renders the share button", () => {
    render(<ShareButton postId="123" title="Test Post" />);
    expect(screen.getByTitle("Share this post")).toBeInTheDocument();
  });

  it("copies link to clipboard when share API is not available", async () => {
    render(<ShareButton postId="123" title="Test Post" />);
    fireEvent.click(screen.getByTitle("Share this post"));
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
  });

  it("shows 'Link copied!' tooltip after copy", async () => {
    jest.useFakeTimers();
    render(<ShareButton postId="123" title="Test Post" />);
    fireEvent.click(screen.getByTitle("Share this post"));
    expect(await screen.findByText("Link copied!")).toBeInTheDocument();
    jest.useRealTimers();
  });

  it("uses share API when available", async () => {
    const mockShare = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "share", { value: mockShare, writable: true });

    render(<ShareButton postId="456" title="My Post" />);
    fireEvent.click(screen.getByTitle("Share this post"));
    expect(mockShare).toHaveBeenCalledWith({
      title: "My Post",
      url: expect.stringContaining("456"),
    });
  });
});
