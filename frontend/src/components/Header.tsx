import {Link} from 'react-router-dom';
import "bootstrap/js/src/collapse.js";

function Header() {
    return (
        <>
            <nav className="navbar navbar-expand-sm navbar-dark bg-success mb-3">
                <div className="container-fluid">
                    <Link className="navbar-brand me-5" to="/">Mini Wiki</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
                    <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav">
                        <li className="nav-item px-2">
                            <Link className="nav-link" to="/">Wikis</Link>
                        </li>
                        <li className="nav-item px-2">
                            <Link className="nav-link" to="/">Profile</Link>
                        </li>
                    </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header;