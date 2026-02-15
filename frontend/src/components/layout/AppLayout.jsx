import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, LogOut, Settings, Plus, Search, Bell } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, isActive, onClick }) => {
    return (
        <Link
            to={to}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors mb-1",
                isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]"
            )}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
        </Link>
    );
};

const AppLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, login } = useAuth(); // Assuming logout might be needed later

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <div className="flex h-screen bg-[#0e1016] text-[#ededef]">
            {/* Sidebar */}
            <aside className="w-[240px] flex flex-col border-r border-white/[0.08] bg-[#111319]">
                <div className="h-14 flex items-center px-4 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Layout className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight text-white">CollabBoard</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-2">
                    <div className="mb-6">
                        <h4 className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Workspace</h4>
                        <SidebarItem
                            icon={Layout}
                            label="Boards"
                            to="/"
                            isActive={location.pathname === '/'}
                        />
                        <SidebarItem
                            icon={Settings}
                            label="Settings"
                            to="/settings"
                            isActive={location.pathname === '/settings'}
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between px-3 mb-2 group">
                            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Favorites</h4>
                            <button className="text-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                        {/* Example Favorites */}
                        <div className="px-3 text-sm text-gray-500 italic">No favorites yet</div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/[0.08]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/[0.04] rounded-md transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                    </button>
                    <div className="mt-4 flex items-center gap-3 px-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xs font-bold border border-white/10">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">{user?.username}</div>
                            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0e1016]">
                {children}
            </main>
        </div>
    );
};

export default AppLayout;
