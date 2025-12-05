import { Link } from "react-router-dom";
import "bootstrap/js/src/collapse.js";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

function Header() {

  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);

  return (
    <>
      <nav className="navbar navbar-expand-sm navbar-dark bg-primary mb-3">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center justify-content-center" to="/home">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" className="bi bi-book-half" viewBox="0 0 16 16">
              <path d="M8.5 2.687c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783"/>
            </svg>
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
              {currentUser && <>
                <li className="nav-item px-2">
                  <Link className="nav-link" to="/profile">
                    Profile
                  </Link>
                </li>
                <li className="nav-item px-2">
                  <Link className="nav-link" to="/">
                    Browse
                  </Link>
                </li>
                <li className="nav-item px-2">
                  <Link className="nav-link" to="/">
                    Create
                  </Link>
                </li>
              </>}
              {!currentUser && <>
                <li className="nav-item px-2">
                  <Link className="nav-link" to="/signup">
                    Register
                  </Link>
                </li>
                <li className="nav-item px-2">
                  <Link className="nav-link" to="/signin">
                    Login
                  </Link>
                </li>
              </>}
              <li className="nav-item px-2">
                <Link className="nav-link" to="/testing">
                  Testing
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Header;
