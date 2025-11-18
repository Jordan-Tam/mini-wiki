import "../App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Landing from "./Landing";
import Account from "./Account";
import SignIn from "./SignIn";
import Navigation from "./Navigation";
import SignUp from "./SignUp";
import { AuthProvider } from "../context/AuthContext";
import PrivateRoute from "./PrivateRoute";
function App() {
  return (
    <AuthProvider>
      <div>
        <header>
          <Navigation />
        </header>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="/account" element={<PrivateRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
