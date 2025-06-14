import { SignIn } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { fetchUser } = useAppContext();
  const navigate = useNavigate();

  return (
    <SignIn
      afterSignIn={async () => {
        await fetchUser(); // ✅ Immediately fetch user data from your backend
        navigate("/owner"); // ✅ Navigate to owner dashboard if needed
      }}
    />
  );
};

export default Login;
