import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishOAuthLogin = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setError("Google sign-in failed. Missing token.");
        return;
      }

      try {
        await completeOAuthLogin(token);
        navigate("/", { replace: true });
      } catch (requestError) {
        setError(requestError.message);
      }
    };

    finishOAuthLogin();
  }, [completeOAuthLogin, navigate, searchParams]);

  if (error) {
    return <p className="error-text">{error}</p>;
  }

  return (
    <section className="auth-card card">
      <span className="eyebrow">Google Sign-In</span>
      <h1>Completing your access</h1>
      <p>We are finalizing your Google login and loading your account.</p>
    </section>
  );
};

export default OAuthSuccessPage;
