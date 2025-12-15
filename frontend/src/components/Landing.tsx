import { Link } from "react-router-dom";



function Landing() {
  return (
    <>
      <h1 className=
      "d-flex justify-content-center text-primary fw-bold display-3 mt-5">
      MINI WIKI
      </h1>

      <p className="d-flex justify-content-center text-center fst-italic">
      Create personalized wikis about the things that you are passionate about.
      </p>

      
      <p className="d-flex justify-content-center ">Get Started Today!</p>
      <br/>
      <Link
      className="btn btn-primary d-block text-center mb-3"
      to="/signin">
      Login
      </Link>

      <Link
        className="btn btn-primary d-block text-center"
        to="/signup">
      Sign Up
      </Link>

      <br/>
      <br/>
      <br/>

      <h3 className="d-flex justify-content-center text-center text-primary">How to use Mini Wiki?</h3>
      
      <ul className="text-center list-unstyled">
        <li>Create your own wikis</li>
        <li>Share wikis with your friends</li>
        <li>Keep wikis private if you prefer</li>
        <li>Chat about interesting wikis</li>
        <li>Favorite the best wikis to access at any time</li>
        <li>Filter wikis to find what you are looking for</li>
        <li>View all wikis you created or have access to</li>
      </ul>

      <br/>
      



    </>
  );
}

export default Landing;
