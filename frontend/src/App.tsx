import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.tsx";
import Landing from "./components/Landing.tsx";
import Home from "./components/Home.tsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import Profile from "./components/Profile.jsx";
import Register from "./components/Register.tsx";

//import Home from "./lecture_components/Home";
//import Landing from "./lecture_components/Landing";
//import Account from "./lecture_components/Account";
//import SignIn from "./lecture_components/SignIn";
//import Navigation from "./lecture_components/Navigation";
//import SignUp from "./lecture_components/SignUp";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute.jsx";
//import "./App.css";
// Zak testing
//import TextEditor from "./lecture_components/TextEditor";

function App() {
  return (
    <>
      {/* <AuthProvider>
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
                        <Route path="/testText" element={<TextEditor />} />
                    </Routes>
                </div>
            </AuthProvider> */}
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/home" element={<PrivateRoute />}>
            <Route path="/home" element={<Home />} />
          </Route>
          <Route path="/profile" element={<PrivateRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/register" element={<Register />} />
          <Route path="/wiki/:wikiId">
            <Route path=":category" />
            <Route path="chat" />
            <Route path="collaborators" />
            <Route path="new-page" />
            <Route path=":pageId" />
            <Route path=":pageId/edit" />
            <Route path="search" />
          </Route>
        </Routes>
      </AuthProvider>
    </>
  );
}

export default App;
