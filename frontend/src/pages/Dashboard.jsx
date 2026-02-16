import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
// Assuming the Dashboard component starts here, e.g., `const Dashboard = () => {`
// The following code should be inside the Dashboard component's function body.

// Inside Dashboard component
// Assuming `fetchBoards`, `toast`, `AppLayout`, `Input`, `Button`, `Modal`, `setIsModalOpen`, `handleCreateBoard`, `newBoardTitle`, `setNewBoardTitle`, `isLoading`, `ownedBoards`, `sharedBoards` are defined within the Dashboard component.

const Dashboard = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [ownedBoards, setOwnedBoards] = useState([]);
    const [sharedBoards, setSharedBoards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchBoards();
    }, []);

    // ... socket effect ...



    const fetchBoards = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5001/api/boards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both legacy array and new object format
            if (Array.isArray(data)) {
                setOwnedBoards(data);
                setSharedBoards([]);
            } else {
                setOwnedBoards(data.ownedBoards || []);
                setSharedBoards(data.sharedBoards || []);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load boards');
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        if (!newBoardTitle.trim()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/boards', { title: newBoardTitle }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewBoardTitle('');
            setIsModalOpen(false);
            toast.success('Board created successfully');
            fetchBoards();
        } catch (error) {
            console.error(error);
            toast.error('Failed to create board');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteBoard = async (e, boardId) => {
        e.preventDefault(); // Prevent navigation
        if (!window.confirm('Are you sure you want to delete this board? This cannot be undone.')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/boards/${boardId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Board deleted');
            fetchBoards();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete board');
        }
    };

    const BoardCard = ({ board, isShared }) => (
        <Link
            to={`/board/${board._id}`}
            key={board._id}
            className="group h-36 bg-[#16181d] hover:bg-[#1c1f26] border border-white/[0.08] hover:border-indigo-500/30 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-indigo-500/5 relative overflow-hidden"
        >
            <div>
                <h3 className="font-semibold text-white group-hover:text-indigo-200 transition-colors truncate pr-6">{board.title}</h3>
                <p className="text-xs text-gray-500 mt-1">Updated recently</p>

                {/* Delete Button (Only for owners, if not shared) */}
                {!isShared && (
                    <button
                        onClick={(e) => handleDeleteBoard(e, board._id)}
                        className="absolute top-4 right-4 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                        title="Delete Board"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
            <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 bg-white/[0.03] px-2 py-1 rounded">
                    {isShared ? 'Shared' : 'Project'}
                </span>
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20">
                    {board.title.charAt(0).toUpperCase()}
                </div>
            </div>
        </Link>
    );

    return (
        <AppLayout>
            {/* Dashboard Header */}
            <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-6 bg-[#0e1016]">
                <div className="flex items-center gap-4 w-full">
                    <h1 className="text-sm font-semibold text-white">Dashboard</h1>
                    <div className="h-4 w-[1px] bg-white/[0.1]"></div>
                    <div className="relative flex-1 max-w-md hidden md:block">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                            placeholder="Search boards..."
                            className="bg-[#16181d] pl-9 border-transparent focus:bg-[#0e1016] focus:border-indigo-500/50"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button size="sm" variant="secondary" className="gap-2 hidden md:flex">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Filter</span>
                    </Button>
                    <Button size="sm" onClick={() => setIsModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> New Board
                    </Button>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-8 space-y-8">
                {/* My Boards Section */}
                <div>
                    <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                        My Boards
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Create New Board Card */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group h-36 rounded-xl border border-dashed border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer transition-all"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/[0.05] group-hover:bg-white/[0.1] flex items-center justify-center mb-3 transition-colors">
                                <Plus className="w-5 h-5 text-gray-400 group-hover:text-white" />
                            </div>
                            <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Create new board</span>
                        </button>

                        {/* Owned Boards */}
                        {ownedBoards.map((board) => (
                            <BoardCard key={board._id} board={board} isShared={false} />
                        ))}
                    </div>
                </div>

                {/* Shared Boards Section */}
                {sharedBoards.length > 0 && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-emerald-500 rounded-full"></span>
                            Shared With Me
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {sharedBoards.map((board) => (
                                <BoardCard key={board._id} board={board} isShared={true} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Board Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Board">
                <form onSubmit={handleCreateBoard} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Board Name</label>
                        <Input
                            value={newBoardTitle}
                            onChange={(e) => setNewBoardTitle(e.target.value)}
                            placeholder="e.g. Q3 Roadmap"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isLoading}>Create Board</Button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
};

export default Dashboard;
