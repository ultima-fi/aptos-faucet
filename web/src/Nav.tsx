import { Link, useLocation } from "react-router-dom";

export function Nav() {
  const location = useLocation();
  return (
    <div className="tabs">
      <ul>
        <li className={location.pathname === "/" ? "is-active" : ""}>
          <Link to="/">Create</Link>
        </li>
        <li className={location.pathname === "/mint" ? "is-active" : ""}>
          <Link to="/mint">Mint</Link>
        </li>
        <li>
          <a>Transfer</a>
        </li>
      </ul>
    </div>
  );
}
