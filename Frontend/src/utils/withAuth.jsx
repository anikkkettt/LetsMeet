import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const navigate = useNavigate();

    const isAuthenticated = () => {
      return !!localStorage.getItem("token");
    };

    // agar authenticated nahi hai toh auth page pe redirect karo
    useEffect(() => {
      if (!isAuthenticated()) {
        navigate("/auth");
      }
    }, []);

    // agar authenticated hai toh wrapped component return karo
    return isAuthenticated() ? <WrappedComponent {...props} /> : null;
  };

  return AuthComponent;
};

export default withAuth;