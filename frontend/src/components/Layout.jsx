import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Program Review" },
  { to: "/review-prep", label: "Review Preparation" },
  { to: "/grants", label: "Grant Reporting" },
];

export default function Layout({ children }) {
  return (
    <div className="app-shell">
      <aside className="sidebar flex-shrink-0">
        <div>
          <div className="brand-title">Mantra4Change</div>
          <div className="brand-sub">Program Intelligence</div>
        </div>
        <nav className="nav-links">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
