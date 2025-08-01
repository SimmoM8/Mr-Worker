import { Outlet } from 'react-router-dom';
import './DashboardLayout.css';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function DashboardLayout() {
  return (
    <div className="app-layout d-flex" style={{ minHeight: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main className="d-flex flex-column flex-grow-1">
        <Topbar />
        <div className="main-content flex-grow-1 overflow-auto px-3 py-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
