import Reducer from "../Reducer";

describe("Reducer", () => {
  const initialState = {
    user: null,
    token: null,
    isFetching: false,
    error: false,
    theme: "light",
  };

  it("should return initial state for unknown action", () => {
    const result = Reducer(initialState, { type: "UNKNOWN" });
    expect(result).toEqual(initialState);
  });

  describe("LOGIN_START", () => {
    it("should set isFetching to true and error to false", () => {
      const result = Reducer(initialState, { type: "LOGIN_START" });
      expect(result.isFetching).toBe(true);
      expect(result.error).toBe(false);
    });
  });

  describe("LOGIN_SUCCESS", () => {
    it("should set user, token, and clear fetching/error", () => {
      const payload = { user: { username: "test" }, token: "abc123" };
      const result = Reducer(initialState, { type: "LOGIN_SUCCESS", payload });
      expect(result.user).toEqual({ username: "test" });
      expect(result.token).toBe("abc123");
      expect(result.isFetching).toBe(false);
      expect(result.error).toBe(false);
    });
  });

  describe("LOGIN_FAILURE", () => {
    it("should clear user and token, set error", () => {
      const state = { ...initialState, user: { username: "test" }, token: "abc" };
      const result = Reducer(state, { type: "LOGIN_FAILURE" });
      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.error).toBe(true);
    });
  });

  describe("UPDATE_START", () => {
    it("should set isFetching to true", () => {
      const result = Reducer(initialState, { type: "UPDATE_START" });
      expect(result.isFetching).toBe(true);
    });
  });

  describe("UPDATE_SUCCESS", () => {
    it("should update user and clear fetching/error", () => {
      const payload = { username: "updated" };
      const result = Reducer(initialState, { type: "UPDATE_SUCCESS", payload });
      expect(result.user).toEqual({ username: "updated" });
      expect(result.isFetching).toBe(false);
      expect(result.error).toBe(false);
    });
  });

  describe("UPDATE_FAILURE", () => {
    it("should set error and clear fetching", () => {
      const result = Reducer(initialState, { type: "UPDATE_FAILURE" });
      expect(result.error).toBe(true);
      expect(result.isFetching).toBe(false);
    });
  });

  describe("LOGOUT", () => {
    it("should clear user, token, and reset state", () => {
      const state = { ...initialState, user: { username: "test" }, token: "abc", isFetching: true };
      const result = Reducer(state, { type: "LOGOUT" });
      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.isFetching).toBe(false);
      expect(result.error).toBe(false);
    });
  });

  describe("TOGGLE_THEME", () => {
    it("should toggle from light to dark", () => {
      const result = Reducer(initialState, { type: "TOGGLE_THEME" });
      expect(result.theme).toBe("dark");
    });

    it("should toggle from dark to light", () => {
      const state = { ...initialState, theme: "dark" };
      const result = Reducer(state, { type: "TOGGLE_THEME" });
      expect(result.theme).toBe("light");
    });
  });
});
