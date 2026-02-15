import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [boards, setBoards] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardTitle, setNewBoardTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5001/api/boards', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBoards(data);
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
            <div className="p-8">
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

                    {/* Board Cards */}
                    {boards.map((board) => (
                        <Link
                            to={`/board/${board._id}`}
                            key={board._id}
                            className="group h-36 bg-[#16181d] hover:bg-[#1c1f26] border border-white/[0.08] hover:border-indigo-500/30 rounded-xl p-5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-indigo-500/5 relative overflow-hidden"
                        >
                            <div>
                                <h3 className="font-semibold text-white group-hover:text-indigo-200 transition-colors truncate">{board.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">Updated recently</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 bg-white/[0.03] px-2 py-1 rounded">Project</span>
                                <div className="w-6 h-6 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold border border-indigo-500/20">
                                    M
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
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
