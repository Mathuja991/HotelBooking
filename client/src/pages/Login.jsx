import { SignIn } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { fetchUser } = useAppContext();
  const navigate = useNavigate();

  return (
    <SignIn
     afterSignIn={async () => {
    await fetchUser();  // ✅ this triggers the role update logic
    window.location.reload();  // ✅ force reload to reflect changes
  }}
    />
  );
};

export default Login;
