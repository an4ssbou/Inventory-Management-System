import { Outlet } from 'react-router-dom';
import SideBar from '../components/SideBar';

const DashboardLayout = () => (
  <div className="min-h-[calc(100vh-68px)] bg-slate-100">
    <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-4 py-4 lg:flex-row lg:px-6">
      <SideBar />
      <main className="min-w-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Outlet />
      </main>
    </div>
  </div>
);

export default DashboardLayout;
