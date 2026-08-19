import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Posts from "../Posts";
import { Context } from "../../../context/Context";

const mockPosts = [
  {
    _id: "1",
    title: "First Post",
    desc: "Description 1",
    photo: "photo1.jpg",
    username: "user1",
    categories: ["travel"],
    tags: ["adventure"],
    likes: [],
    comments: [],
    views: 10,
    createdAt: "2024-01-01",
  },
  {
    _id: "2",
    title: "Second Post",
    desc: "Description 2",
    username: "user2",
    categories: ["food"],
    tags: ["cooking"],
    likes: ["u1"],
    comments: [{ _id: "c1", text: "Nice!" }],
    views: 25,
    createdAt: "2024-01-02",
  },
];

const renderWithProviders = (ui) => {
  return render(
    <MemoryRouter>
      <Context.Provider value={{ token: null, user: null }}>
        {ui}
      </Context.Provider>
    </MemoryRouter>
  );
};

describe("Posts", () => {
  it("renders all posts", () => {
    renderWithProviders(<Posts posts={mockPosts} />);
    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  it("renders empty div when no posts", () => {
    const { container } = renderWithProviders(<Posts posts={[]} />);
    expect(container.querySelector(".posts")).toBeInTheDocument();
    expect(container.querySelector(".posts").children).toHaveLength(0);
  });
});
