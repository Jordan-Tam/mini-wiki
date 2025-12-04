import { Link } from "react-router-dom";
import "bootstrap/js/src/collapse.js";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

function Header() {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-dark bg-success mb-3">
        <div className="container-fluid">
        <Link className="navbar-brand me-5" to={currentUser ? "/home" : "/"} >
        Mini Wiki
        </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav">
              <li className="nav-item px-2">
                <Link className="nav-link" to="/testing">
                  Wikis (temporary testing page)
                </Link>
              </li>
              {/* <li className="nav-item px-2">
                <Link className="nav-link" to="/profile">
                  Profile
                </Link>
              </li> */}
            </ul>
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                {currentUser ? (
                  <Link
                    className="nav-item btn-dark btn my-2 my-sm-0"
                    to="/profile"
                  >
                    {currentUser.displayName}'s Profile
                  </Link>
                ) : (
                  <>
                  <Link
                    className="nav-item btn-dark btn my-2 my-sm-0"
                    to="/signin"
                  >
                    Login
                  </Link>


                  <Link
                  className="nav-item btn-dark btn my-2 my-sm-0 ms-1"
                  to="/signup"
                >
                  Sign Up
                </Link>
                </>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
