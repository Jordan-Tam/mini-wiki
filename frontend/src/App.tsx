import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.tsx";
import Landing from "./components/Landing.tsx";
import Home from "./components/Home.jsx";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import Profile from "./components/Profile.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import TestingPage from "./components/TestingPage.jsx";
import WikiHome from "./components/WikiHome.tsx";
import ArticleCreator from "./components/ArticleCreator.tsx";
import Article from "./components/Article.tsx";
import Browse from "./components/Browse.jsx";
import CreateWiki from "./components/CreateWiki.jsx";
import CategoryPage from "./components/CategoryPage.jsx";

/**
 * FORBIDDEN WIKI URL NAMES:
 * browse, create, home, profile, user, signin, signup, testing
 * 
 * FORBIDDEN PAGE NAMES:
 * category, chat, search
 */

function App() {
	return (
		<>
			<AuthProvider>
				<Header />
				<Routes>
					<Route path="/" element={<Landing />} />
					<Route path="/browse" element={<Browse />} />
					<Route path="/create" element={<CreateWiki />} />
					<Route path="/home" element={<PrivateRoute />}>
						<Route path="/home" element={<Home />} />
					</Route>
					<Route path="/profile" element={<PrivateRoute />}>
						<Route path="/profile" element={<Profile />} />
					</Route>
					{/* <Route path="/user" /> */}
					<Route path="/signin" element={<SignIn />} />
					<Route path="/signup" element={<SignUp />} />
					<Route path="/testing" element={<TestingPage />} />
					<Route path="/:wikiUrlName" element={<WikiHome />} />
					<Route path="/:wikiUrlName/category/:category" element={<CategoryPage />} />
					{/* <Route path="/:wikiUrlName/chat" /> */}
					{/* <Route path="/:wikiUrlName/search" /> */}
					<Route path="/:wikiUrlName/:pageUrlName" element={<Article fetchFromUrl={true} editHref="/edit" />} />
					<Route path="/:wikiUrlName/:pageId/create" element={<ArticleCreator />} />
					<Route path="/:wikiUrlName/:pageId/edit" element={<ArticleCreator />} />
				</Routes>
			</AuthProvider>
		</>
	);
}

export default App;
