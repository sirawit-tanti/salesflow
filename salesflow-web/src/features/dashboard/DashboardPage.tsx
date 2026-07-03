import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          SalesFlow overview will be added in a later step.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-colds-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Logged in as</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {user?.name}
          </p>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Role</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {user?.role?.display_name}
          </p>
        </div>
      </div>
    </div>
  );
}
