import { useLocation } from "react-router-dom";
import ResetPassword from "./ResetPassword";

export default function ResetPasswordPage() {
  const search = new URLSearchParams(useLocation().search);
  const token = search.get("token");
  const email = search.get("email");

  return <ResetPassword token={token} email={email} />;
}