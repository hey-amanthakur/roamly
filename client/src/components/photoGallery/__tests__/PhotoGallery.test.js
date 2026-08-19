import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PhotoGallery from "../PhotoGallery";

const photos = ["img1.jpg", "img2.jpg", "img3.jpg"];

describe("PhotoGallery", () => {
  it("renders nothing when no photos", () => {
    const { container } = render(<PhotoGallery photos={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when photos is null", () => {
    const { container } = render(<PhotoGallery photos={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders gallery thumbnails", () => {
    render(<PhotoGallery photos={photos} />);
    expect(screen.getAllByAltText(/Gallery/)).toHaveLength(3);
  });

  it("opens lightbox on thumbnail click", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getAllByAltText(/Gallery/)[0]);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("navigates to next image", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getAllByAltText(/Gallery/)[0]);
    fireEvent.click(screen.getByText("›"));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("navigates to previous image", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getAllByAltText(/Gallery/)[0]);
    fireEvent.click(screen.getByText("‹"));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
  });

  it("closes lightbox on backdrop click", () => {
    render(<PhotoGallery photos={photos} />);
    fireEvent.click(screen.getAllByAltText(/Gallery/)[0]);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    const closeBtn = screen.getByText("×");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("1 / 3")).not.toBeInTheDocument();
  });

  it("does not show nav buttons for single photo", () => {
    render(<PhotoGallery photos={["single.jpg"]} />);
    fireEvent.click(screen.getByAltText("Gallery 1"));
    expect(screen.queryByText("‹")).not.toBeInTheDocument();
    expect(screen.queryByText("›")).not.toBeInTheDocument();
  });
});
