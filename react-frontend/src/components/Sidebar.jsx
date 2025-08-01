import { NavLink } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Sidebar() {
  return (
    <div className="main-nav">
      <aside
        className="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark fixed-top vh-100"
        style={{ width: '280px' }}
        id="sidebar"
      >
        <a href="#" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
          <svg className="bi me-3" width="40" height="32" role="img" aria-label="Bootstrap">
            <use xlinkHref="#bootstrap"></use>
          </svg>
          <span className="fs-4">My Dashboard</span>
        </a>
        <hr />
        <ul className="sidebar-nav nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/">
              <i className="fas fa-file-lines me-3"></i>Resumes
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/work">
              <i className="fas fa-briefcase me-3"></i>Work Experience
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/education">
              <i className="fa-solid fa-graduation-cap me-3"></i>Education
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/skills">
              <i className="fa-solid fa-id-card me-3"></i>Skills
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/profile">
              <i className="fa-solid fa-user-tie me-3"></i>Profile
            </NavLink>
          </li>
        </ul>
        <hr />
        <div className="dropdown">
          <a
            href="#"
            className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <div
              className="me-3"
              style={{
                width: '40px',
                height: '40px',
                overflow: 'hidden',
                borderRadius: '50%',
                position: 'relative',
              }}
            ></div>
            <strong>Username</strong>
          </a>
          <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
            <li>
              <a className="dropdown-item" href="#">
                New resume...
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Settings
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Sign out
              </a>
            </li>
          </ul>
        </div>
        <hr />
        <div>
          <p className="text-muted copywrite bg-dark">
            © {new Date().getFullYear()} Mr.Worker. All rights reserved. | Version Alpha--V1.0.8
            <a href="/terms-of-service">Terms of Service</a> | <a href="/privacy-policy">Privacy Policy</a>
          </p>
        </div>
      </aside>
    </div>
  );
}
