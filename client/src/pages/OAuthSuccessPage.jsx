import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../api/client";

const OAuthSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const finishOAuthLogin = async () => {
      const code = searchParams.get("code");

      if (!code) {
        setError("Missing OAuth code.");
        return;
      }

      try {
        const data = await apiRequest("/auth/oauth/complete", {
          method: "POST",
          body: JSON.stringify({ code }),
        });
        await completeOAuthLogin(data.token);
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
    <section className="empty-panel">
      <span className="section-kicker">Google OAuth</span>
      <h1>Accesso in completamento.</h1>
      <p>Sto caricando il profilo e finalizzando la sessione.</p>
    </section>
  );
};

export default OAuthSuccessPage;
