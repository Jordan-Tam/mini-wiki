import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext, type FbUserContextMaybe } from "../context/AuthContext";

const PrivateRoute = () => {
  const { currentUser } = useContext(AuthContext) as FbUserContextMaybe;
  return (
    currentUser
    ?
    <Outlet />
    :
    <Navigate to="/signin" replace={true} />
  );
};

export default PrivateRoute;