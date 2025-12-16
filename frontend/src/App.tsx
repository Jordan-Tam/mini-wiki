import { Route, Routes } from "react-router-dom";
import Header from "./components/Header.tsx";
import Landing from "./components/Landing.tsx";
import Home from "./components/Home.js";
import SignIn from "./components/SignIn.jsx";
import SignUp from "./components/SignUp.jsx";
import Profile from "./components/Profile.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import TestingPage from "./components/TestingPage.jsx";
import WikiHome from "./components/WikiHome.tsx";
import ArticleCreator from "./components/ArticleCreator.tsx";
import Article from "./components/Article.tsx";
import Discover from "./components/Discover.tsx";
import CreateWiki from "./components/CreateWiki.tsx";
import CategoryPage from "./components/CategoryPage.tsx";
import Settings from "./components/Settings.tsx";
import "./styles/editors.css";
import "./styles/article.css";
import { ChatPage } from "./components/ChatPage.tsx";

/**
 * FORBIDDEN WIKI URL NAMES:
 * discover, create, home, profile, user, signin, signup, testing
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
			  <Route path="/discover" element={<PrivateRoute />}>
				<Route path="/discover" element={<Discover />} />
			  </Route>
			  <Route path="/create" element={<PrivateRoute />}>
				<Route path="/create" element={<CreateWiki />} />
			  </Route>
			  <Route path="/home" element={<PrivateRoute />}>
				<Route path="/home" element={<Home />} />
			  </Route>
			  <Route path="/settings" element={<PrivateRoute />}>
				<Route path="/settings" element={<Settings />} />
			  </Route>
			  <Route path="/profile/:id" element={<PrivateRoute />}>
				<Route path="/profile/:id" element={<Profile />} />
			  </Route>
			  {/* <Route path="/user" /> */}
			  <Route path="/signin" element={<SignIn />} />
			  <Route path="/signup" element={<SignUp />} />
			  <Route path="/testing" element={<TestingPage />} />
			  <Route path="/:wikiUrlName" element={<PrivateRoute />}>
				<Route path="/:wikiUrlName" element={<WikiHome />} />
			  </Route>
			  <Route
				path="/:wikiUrlName/category/:categoryUrlName"
				element={<PrivateRoute />}
			  >
				<Route
				  path="/:wikiUrlName/category/:categoryUrlName"
				  element={<CategoryPage />}
				/>
			  </Route>
			  {/* <Route path="/:wikiUrlName/chat" /> */}
			  {/* <Route path="/:wikiUrlName/search" /> */}
			  <Route path="/:wikiUrlName/:pageUrlName" element={<PrivateRoute />}>
				<Route
				  path="/:wikiUrlName/:pageUrlName"
				  element={<Article fetchFromUrl={true} editHref="/edit" />}
				/>
			  </Route>
			  <Route path="/:wikiUrlName/:pageId/create" element={<PrivateRoute />}>
				<Route
				  path="/:wikiUrlName/:pageId/create"
				  element={<ArticleCreator />}
				/>
			  </Route>
			  <Route path="/:wikiUrlName/:pageId/edit" element={<PrivateRoute />}>
				<Route
				  path="/:wikiUrlName/:pageId/edit"
				  element={<ArticleCreator />}
				/>
			  </Route>
			  <Route path="/:wikiUrlName/chat" element={<ChatPage />}/>
			</Routes>
		  </AuthProvider>
		</>
	  );
}

export default App;
