import { useNavigate } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";

export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">Welcome back</p>
          <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {user?.role?.name}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
