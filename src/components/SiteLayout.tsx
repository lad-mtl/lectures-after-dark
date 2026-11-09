import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import "../styles/site.css";
export function SiteLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Lectures After Dark | Talks, questions & conversation";
  }, [pathname]);
  return (
    <div className="lad-public">
      <a className="lad-skip" href="#main">
        Skip to content
      </a>
      <header className="lad-header">
        <div className="lad-container lad-nav">
          <Link
            className="lad-brand"
            to="/"
            aria-label="Lectures After Dark home"
          >
            <img
              src="/images/lad-header-logo-520.png"
              alt="Lectures After Dark"
              width={1638}
              height={520}
            />
          </Link>
          <nav aria-label="Main navigation">
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/events">Events</NavLink>
            <NavLink to="/speakers">Speakers</NavLink>
            <NavLink to="/topics">Topics</NavLink>
            <NavLink className="lad-button" to="/get-involved">
              Get involved
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="lad-footer">
        <div className="lad-container lad-footer-inner">
          <div>
            <strong>Lectures After Dark</strong>
            <p>Talks, questions & conversation.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link to="/about">About Us</Link>

            <a
              href="https://www.instagram.com/lecturesafterdark/"
              target="_blank"
              rel="noreferrer"
            >
              Instagram ↗
            </a>
            <Link to="/privacy">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
