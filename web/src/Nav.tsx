import { Link, useLocation } from "react-router-dom";

function NavLink(props: { path: string; display: string }) {
  const location = useLocation();

  return (
    <li className={location.pathname === props.path ? "is-active" : ""}>
      <Link to={props.path}>{props.display}</Link>
    </li>
  );
}

export function Nav() {
  return (
    <div className="tabs">
      <ul>
        <NavLink path="/" display="Create" />
        <NavLink path="/register" display="Register" />
        <NavLink path="/mint" display="Mint" />
        <NavLink path="/balances" display="Balances" />
        <NavLink path="/transfer" display="Transfer" />
      </ul>
    </div>
  );
}
