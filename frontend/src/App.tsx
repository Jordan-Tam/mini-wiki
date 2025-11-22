import { Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Landing from "./components/Landing";
import Account from "./components/Account";
import SignIn from "./components/SignIn";
import Navigation from "./components/Navigation";
import SignUp from "./components/SignUp";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import "./App.css";

function App() {

    return (
        <>
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
            {/* <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/wiki/:wikiId">
                    <Route path="/:category" />
                    <Route path="/chat" />
                    <Route path="/collaborators" />
                    <Route path="/new-page" />
                    <Route path="/:pageId" />
                    <Route path="/:pageId/edit" />
                    <Route path="/search" />
                </Route>
            </Routes> */}
        </>
    )
}

export default App;
