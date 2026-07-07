import { NavLink } from "react-router";
import { useAuth } from "../../features/auth/AuthContext";
import type { RoleName } from "../../features/auth/authType";

interface NavItem {
  label: string;
  to: string;
  roles?: RoleName[];
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard",
  },
  {
    label: "Customers",
    to: "/customers",
    roles: ["ADMIN", "SALES", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Products",
    to: "/products",
    roles: ["ADMIN", "SALES", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Quotations",
    to: "/quotations",
    roles: ["ADMIN", "SALES", "ACCOUNTANT", "MANAGER"],
  },
  {
    label: "Invoices",
    to: "/invoices",
    roles: ["ADMIN", "SALES", "ACCOUNTANT", "MANAGER"],
  },
];

export function Sidebar() {
  const { user } = useAuth();

  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) {
      return true;
    }

    const roleName = user?.role?.name;

    if (!roleName) {
      return false;
    }

    return item.roles.includes(roleName);
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

      <div className="px-6 py-4 text-xs text-slate-400">
        Next: Customers, Products, Quotations
      </div>
    </aside>
  );
}
