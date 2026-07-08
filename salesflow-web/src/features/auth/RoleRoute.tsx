import { Navigate, Outlet } from "react-router";
import { hasRole } from "../../lib/permissions";
import type { RoleName } from "./authType";
import { useAuth } from "./AuthContext";

interface RoleRouteProps {
  roles: RoleName[];
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user } = useAuth();

  if (!hasRole(user?.role?.name, roles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
