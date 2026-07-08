import { NavLink } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";
import type { RoleName } from "../../features/auth/authType";
import { hasRole } from "../../lib/permissions";

interface NavItem {
  label: string;
  to: string;
  roles?: RoleName[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
    roles: ["ADMIN", "SALES", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Customers",
    to: "/customers",
    roles: ["ADMIN", "SALES"],
  },
  {
    label: "Products",
    to: "/products",
    roles: ["ADMIN", "SALES"],
  },
  {
    label: "Quotations",
    to: "/quotations",
    roles: ["ADMIN", "SALES", "MANAGER"],
  },
  {
    label: "Invoices",
    to: "/invoices",
    roles: ["ADMIN", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Receipts",
    to: "/receipts",
    roles: ["ADMIN", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Reports",
    to: "/reports",
    roles: ["ADMIN", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Audit Logs",
    to: "/audit-logs",
    roles: ["ADMIN", "MANAGER"],
  },
];

export function Sidebar() {
  const { user } = useAuth();

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) {
      return true;
    }

    return hasRole(user?.role?.name, item.roles);
  });

  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white lg:block">
      <div className="border-b boder-slate-200 px-6 py-5">
        <h1 className="text-xl font-bold text-slate-900">SalesFlow</h1>
        <p className="mt-1 text-xs text-slate-500">
          Quotation & Invoice System
        </p>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
