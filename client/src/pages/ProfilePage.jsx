import { useAuth } from "../hooks/useAuth";

const ProfilePage = () => {
  const { auth } = useAuth();

  return (
    <section className="card profile-card">
      <span className="eyebrow">Profile</span>
      <h1>Account overview</h1>
      <div className="detail-metrics">
        <div>
          <span>Name</span>
          <strong>{auth?.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{auth?.email}</strong>
        </div>
        <div>
          <span>Role</span>
          <strong>{auth?.role}</strong>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
