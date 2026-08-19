import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Post from "../Post";
import { Context } from "../../../context/Context";

const mockPost = {
  _id: "post1",
  title: "Test Post Title",
  desc: "This is a test post description that is quite long and should be truncated",
  photo: "photo.jpg",
  username: "testuser",
  categories: ["travel", "food"],
  tags: ["adventure", "foodie"],
  likes: ["u1", "u2"],
  comments: [{ _id: "c1", text: "Great!" }],
  views: 42,
  createdAt: "2024-06-15T10:00:00Z",
};

const renderPost = (contextValue = {}) => {
  const defaultContext = {
    token: null,
    user: null,
    ...contextValue,
  };
  return render(
    <MemoryRouter>
      <Context.Provider value={defaultContext}>
        <Post post={mockPost} />
      </Context.Provider>
    </MemoryRouter>
  );
};

describe("Post", () => {
  it("renders post title and description", () => {
    renderPost();
    expect(screen.getByText("Test Post Title")).toBeInTheDocument();
    expect(screen.getByText(mockPost.desc)).toBeInTheDocument();
  });

  it("renders post image", () => {
    renderPost();
    expect(screen.getByAltText("Test Post Title")).toHaveAttribute(
      "src",
      expect.stringContaining("photo.jpg")
    );
  });

  it("renders categories", () => {
    renderPost();
    expect(screen.getByText("travel")).toBeInTheDocument();
    expect(screen.getByText("food")).toBeInTheDocument();
  });

  it("renders tags", () => {
    renderPost();
    expect(screen.getByText("#adventure")).toBeInTheDocument();
    expect(screen.getByText("#foodie")).toBeInTheDocument();
  });

  it("renders stats (likes, comments, views)", () => {
    renderPost();
    expect(screen.getByText("2")).toBeInTheDocument(); // likes
    expect(screen.getByText("1")).toBeInTheDocument(); // comments
    expect(screen.getByText("42")).toBeInTheDocument(); // views
  });

  it("renders author name", () => {
    renderPost();
    expect(screen.getByText("testuser")).toBeInTheDocument();
  });

  it("shows bookmark icon for logged in users", () => {
    renderPost({ token: "abc123" });
    expect(document.querySelector(".postBookmark")).toBeInTheDocument();
  });

  it("does not show bookmark icon for logged out users", () => {
    renderPost();
    expect(document.querySelector(".postBookmark")).not.toBeInTheDocument();
  });
});
