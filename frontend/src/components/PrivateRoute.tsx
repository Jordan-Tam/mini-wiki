import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext, type FbUserContextWrapper } from "../context/AuthContext";

const PrivateRoute = () => {
  const { currentUser } = useContext(AuthContext) as FbUserContextWrapper;
  return (
    currentUser
    ?
    <Outlet />
    :
    <Navigate to="/signin" replace={true} />
  );
};

export default PrivateRoute;