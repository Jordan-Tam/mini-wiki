import { Link } from "react-router-dom";



function Landing() {
  return (
    <>
      <h1 
      className= 
      "d-flex justify-content-center text-primary display-3 mt-5">
      MINI WIKI
      </h1>

      <p className="d-flex justify-content-center fw-light text-center fst-italic">
      Create personalized wikis about the things that you are passionate about.
      </p>

      
      <p className="d-flex justify-content-center mb-4" >Get Started Today!</p>
      
      <div className="text-center">

        <Link
        className="btn btn-primary text-center me-4 fs-5"
        to="/signin">
          Login
        </Link>

        <Link
          className="btn btn-primary text-center fs-5"
          to="/signup">
          Sign Up
        </Link>
      </div>

      <br/>

      <h3 className="fw-light d-flex justify-content-center text-center text-primary">
        About Mini Wiki
      </h3>
      
      <ul className="text-center list-unstyled fw-lighter">
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
