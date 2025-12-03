import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.tsx";
import Landing from "./components/Landing.tsx";
import Home from "./components/Home.tsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import Profile from "./components/Profile.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import TestingPage from "./components/TestingPage.jsx"
function App() {
  return (
    <>
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
          <Route path="/testing" element={<TestingPage />} />
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
