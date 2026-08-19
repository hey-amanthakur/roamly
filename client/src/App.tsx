import Homepage from "./pages/homepage/Homepage";
import TopBar from "./components/topbar/TopBar";
import Single from "./pages/single/Single";
import Write from "./pages/write/Write";
import Settings from "./pages/settings/Settings";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Bookmarks from "./pages/bookmarks/Bookmarks";
import Trending from "./pages/trending/Trending";
import Dashboard from "./pages/dashboard/Dashboard";
import Profile from "./pages/profile/Profile";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useContext, useEffect } from "react";
import { Context } from "./context/Context";
import "./app.css";

function App() {
  const { user, theme } = useContext(Context);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Router>
      <div className={`app ${theme}`}>
        <TopBar />
        <Switch>
          <Route exact path="/">
            <Homepage />
          </Route>
          <Route path="/register">{user ? <Homepage /> : <Register />}</Route>
          <Route path="/login">{user ? <Homepage /> : <Login />}</Route>
          <Route path="/write">{user ? <Write /> : <Register />}</Route>
          <Route path="/settings">{user ? <Settings /> : <Register />}</Route>
          <Route path="/bookmarks">{user ? <Bookmarks /> : <Register />}</Route>
          <Route path="/trending">
            <Trending />
          </Route>
          <Route path="/dashboard">{user ? <Dashboard /> : <Register />}</Route>
          <Route path="/profile/:username">
            <Profile />
          </Route>
          <Route path="/post/:postId">
            <Single />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
