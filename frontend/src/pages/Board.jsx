import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext } from '@hello-pangea/dnd';
import { useSocket } from '../context/SocketContext';
import ListColumn from '../components/ListColumn';
import AppLayout from '../components/layout/AppLayout';
import Modal from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Plus, Users, Star, MoreHorizontal, Filter, Search, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import ActivityLog from '../components/ActivityLog';
import { SearchBar } from '../components/ui/SearchBar';
import { Pagination } from '../components/ui/Pagination';

const Board = () => {
    const { id } = useParams();
    const socket = useSocket();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchPage, setSearchPage] = useState(1);
    const [searchMeta, setSearchMeta] = useState({ totalPages: 1, totalCount: 0 });
    const [isSearching, setIsSearching] = useState(false);

    // Modals state
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [activeListId, setActiveListId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isActivityOpen, setIsActivityOpen] = useState(false);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        setSearchPage(1);
        if (!query.trim()) {
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        fetchSearchResults(query, 1);
    };

    const fetchSearchResults = async (query, page) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`http://localhost:5001/api/tasks`, {
                params: { boardId: id, search: query, page, limit: 10 },
                headers: { Authorization: `Bearer ${token}` }
            });
            setSearchResults(data.tasks);
            setSearchMeta({ totalPages: data.totalPages, totalCount: data.totalCount });
        } catch (error) {
            console.error('Search failed', error);
        }
    };

    const handlePageChange = (newPage) => {
        setSearchPage(newPage);
        fetchSearchResults(searchQuery, newPage);
    };

    const handleInvite = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5001/api/boards/${id}/invite`, {
                email: inviteEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('User invited successfully');
            setInviteEmail('');
            setIsInviteModalOpen(false);
            fetchBoard();
        } catch (error) {
            console.error('Invite failed', error);
            toast.error(error.response?.data?.message || 'Failed to invite user');
        }
    };

    // Form state
    const [newListTitle, setNewListTitle] = useState('');
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');

    useEffect(() => {
        fetchBoard();
    }, [id]);

    useEffect(() => {
        if (!socket) return;
        socket.emit('join_board', id);

        socket.on('board_updated', () => {
            fetchBoard();
        });

        socket.on('task_assigned', () => {
            fetchBoard();
        });

        return () => {
            socket.off('board_updated');
        };
    }, [socket, id]);

    const fetchBoard = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`http://localhost:5001/api/boards/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBoard(data);
            setLists(data.lists);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching board:', error);
            toast.error('Failed to load board');
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        try {
            const token = localStorage.getItem('token');
            // Optimistic update could happen here for smoothness

            await axios.put(`http://localhost:5001/api/tasks/${draggableId}`, {
                listId: destination.droppableId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            socket.emit('task_moved', { boardId: id });
            fetchBoard();
        } catch (error) {
            console.error('Move failed', error);
            toast.error('Failed to move task');
        }
    };

    const addList = async (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/lists', {
                title: newListTitle,
                boardId: id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewListTitle('');
            setIsListModalOpen(false);
            fetchBoard();
            socket.emit('board_updated', id);
            toast.success('List added');
        } catch (error) {
            console.error('Error adding list', error);
            toast.error('Failed to add list');
        }
    };

    const openTaskModal = (listId) => {
        setActiveListId(listId);
        setIsTaskModalOpen(true);
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5001/api/tasks', {
                title: newTaskTitle,
                listId: activeListId,
                boardId: id,
                priority: newTaskPriority
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewTaskTitle('');
            setNewTaskPriority('Medium');
            setIsTaskModalOpen(false);
            fetchBoard();
            socket.emit('board_updated', id);
            toast.success('Task created');
        } catch (error) {
            console.error('Error adding task', error);
            toast.error('Failed to create task');
        }
    };

    const handleDeleteList = async (listId) => {
        if (!window.confirm('Delete this list and all its tasks?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/lists/${listId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('List deleted');
            fetchBoard();
            socket.emit('board_updated', id);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete list');
        }
    };

    const handleDeleteTask = async (taskId, listId) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Task deleted');
            fetchBoard();
            socket.emit('board_updated', id);
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete task');
        }
    };

    if (loading) return (
        <AppLayout>
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
        </AppLayout>
    );

    if (!board) return (
        <AppLayout>
            <div className="flex items-center justify-center h-full text-white">Board not found</div>
        </AppLayout>
    );

    return (
        <AppLayout>
            <div className="h-full flex flex-col overflow-hidden">
                {/* Board Header */}
                <header className="h-14 border-b border-white/[0.08] flex items-center justify-between px-4 bg-[#16181d] flex-shrink-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <h1 className="text-sm font-semibold text-white tracking-wide">{board.title}</h1>
                            <Star className="w-3.5 h-3.5 text-gray-600 group-hover:text-yellow-500 transition-colors" />
                        </div>
                        <div className="h-4 w-[1px] bg-white/[0.1]"></div>
                        <div className="flex items-center -space-x-1">
                            {board.members && board.members.filter(Boolean).length > 0 ? (
                                <>
                                    {board.members.filter(Boolean).slice(0, 3).map((m, i) => (
                                        <div key={m._id} className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#16181d] flex items-center justify-center text-[9px] font-bold text-white z-10" title={m.username}>
                                            {m.username.charAt(0).toUpperCase()}
                                        </div>
                                    ))}
                                    {board.members.filter(Boolean).length > 3 && (
                                        <div className="w-6 h-6 rounded-full bg-[#252830] border-2 border-[#16181d] flex items-center justify-center text-[9px] font-bold text-gray-400">
                                            +{board.members.filter(Boolean).length - 3}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-[#16181d] flex items-center justify-center text-[9px] font-bold text-white z-10">M</div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button size="sm" variant="secondary" className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
                            <Users className="w-3.5 h-3.5" /> Invite
                        </Button>
                        <div className="relative w-full md:w-64">
                            <SearchBar onSearch={handleSearch} placeholder="Search tasks..." />
                        </div>
                        <div className="h-4 w-[1px] bg-white/[0.1] hidden md:block"></div>
                        <button
                            onClick={() => setIsActivityOpen(!isActivityOpen)}
                            className={`p-2 rounded-md transition-colors ${isActivityOpen ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'}`}
                            title="Toggle Activity"
                        >
                            <Activity className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                {/* Board Content Wrapper */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Board Canvas OR Search Results */}
                    <main className="flex-1 overflow-x-auto overflow-y-hidden bg-[#0e1016]">
                        {isSearching ? (
                            <div className="h-full p-8 overflow-y-auto">
                                <h2 className="text-lg font-semibold text-white mb-6">
                                    Search Results for "{searchQuery}"
                                </h2>
                                {searchResults.length > 0 ? (
                                    <div className="space-y-4 max-w-4xl">
                                        {searchResults.map(task => (
                                            <div key={task._id} className="bg-[#16181d] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:border-indigo-500/50 transition-colors">
                                                <div>
                                                    <h3 className="text-white font-medium">{task.title}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        in <span className="text-indigo-400">{task.list?.title || 'Unknown List'}</span>
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-[10px] px-2 py-1 rounded border ${task.priority === 'High' ? 'text-red-400 border-red-400/20 bg-red-400/10' :
                                                        task.priority === 'Medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' :
                                                            'text-green-400 border-green-400/20 bg-green-400/10'
                                                        }`}>
                                                        {task.priority}
                                                    </span>

                                                    {/* Assignee Dropdown */}
                                                    <div className="relative group/assign">
                                                        <button className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-white/[0.1] ${task.assignee ? 'bg-indigo-500' : 'bg-white/[0.05] hover:bg-white/[0.1]'}`}>
                                                            {task.assignee ? task.assignee.username.charAt(0).toUpperCase() : <Users className="w-3 h-3 text-gray-400" />}
                                                        </button>

                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#16181d] border border-white/[0.1] rounded-lg shadow-xl overflow-hidden hidden group-hover/assign:block z-50">
                                                            <div className="p-2">
                                                                <div className="text-xs font-semibold text-gray-400 mb-2 px-2">Assign to...</div>
                                                                {board.members && board.members.filter(Boolean).map(member => (
                                                                    <button
                                                                        key={member._id}
                                                                        onClick={async () => {
                                                                            try {
                                                                                const token = localStorage.getItem('token');
                                                                                await axios.patch(`http://localhost:5001/api/tasks/${task._id}/assign`,
                                                                                    { assignee: member._id },
                                                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                                                );
                                                                                socket.emit('task_assigned', { boardId: id });
                                                                                // Update local search results to reflect change immediately
                                                                                setSearchResults(prev => prev.map(t =>
                                                                                    t._id === task._id ? { ...t, assignee: member } : t
                                                                                ));
                                                                                toast.success(`Assigned to ${member.username}`);
                                                                            } catch (err) {
                                                                                toast.error('Failed to assign task');
                                                                            }
                                                                        }}
                                                                        className="w-full text-left px-2 py-1.5 text-sm text-gray-300 hover:bg-white/[0.05] rounded flex items-center gap-2"
                                                                    >
                                                                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] text-white">
                                                                            {member.username.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        {member.username}
                                                                    </button>
                                                                ))}
                                                                <button
                                                                    onClick={async () => {
                                                                        try {
                                                                            const token = localStorage.getItem('token');
                                                                            await axios.patch(`http://localhost:5001/api/tasks/${task._id}/assign`,
                                                                                { assignee: null },
                                                                                { headers: { Authorization: `Bearer ${token}` } }
                                                                            );
                                                                            socket.emit('task_assigned', { boardId: id });
                                                                            setSearchResults(prev => prev.map(t =>
                                                                                t._id === task._id ? { ...t, assignee: null } : t
                                                                            ));
                                                                            toast.success('Task unassigned');
                                                                        } catch (err) {
                                                                            toast.error('Failed to unassign task');
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-2 py-1.5 text-sm text-red-400 hover:bg-red-500/10 rounded mt-1 border-t border-white/[0.05]"
                                                                >
                                                                    Unassign
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTask(task._id, task.list?._id || task.list);
                                                            // Remove from search results
                                                            setSearchResults(prev => prev.filter(t => t._id !== task._id));
                                                        }}
                                                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                                                        title="Delete Task"
                                                    >
                                                        <span className="sr-only">Delete</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <Pagination
                                            currentPage={searchPage}
                                            totalPages={searchMeta.totalPages}
                                            totalCount={searchMeta.totalCount}
                                            onPageChange={handlePageChange}
                                        />
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">No tasks found matching your query.</div>
                                )}
                            </div>
                        ) : (
                            <div className="h-full px-4 py-6 flex space-x-4 min-w-max">
                                <DragDropContext onDragEnd={onDragEnd}>
                                    {lists.map(list => (
                                        <ListColumn
                                            key={list._id}
                                            list={list}
                                            tasks={list.tasks}
                                            onAddTask={openTaskModal}
                                            boardMembers={board.members ? board.members.filter(Boolean) : []}
                                            onDeleteList={() => handleDeleteList(list._id)}
                                            onDeleteTask={(taskId) => handleDeleteTask(taskId, list._id)}
                                        />
                                    ))}
                                </DragDropContext>

                                {/* Add List Button */}
                                <div className="w-[280px] flex-shrink-0">
                                    <button
                                        onClick={() => setIsListModalOpen(true)}
                                        className="w-full bg-transparent hover:bg-white/[0.03] border border-transparent hover:border-white/[0.1] rounded-lg p-3 flex items-center gap-2 text-gray-400 hover:text-gray-200 font-medium transition-all text-[13px]"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Add another list</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </main>

                    {/* Activity Sidebar */}
                    <div className={`w-[320px] bg-[#111319] border-l border-white/[0.08] flex flex-col flex-shrink-0 transition-all duration-300 ${isActivityOpen ? 'mr-0' : '-mr-[320px]'}`}>
                        <div className="h-14 border-b border-white/[0.08] flex items-center justify-between px-4">
                            <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                <Activity className="w-4 h-4 text-indigo-400" />
                                Activity
                            </h3>
                            <button onClick={() => setIsActivityOpen(false)} className="text-gray-500 hover:text-white">
                                &times;
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            {board && <ActivityLog boardId={board._id} />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create List Modal */}
            <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title="Add New List">
                <form onSubmit={addList} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">List Title</label>
                        <Input
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            placeholder="e.g. In Progress"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsListModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create List</Button>
                    </div>
                </form>
            </Modal>

            {/* Create Task Modal */}
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Issue">
                <form onSubmit={addTask} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Title</label>
                        <Input
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Brief description of the task"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Priority</label>
                        <div className="flex gap-2">
                            {['Low', 'Medium', 'High'].map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewTaskPriority(p)}
                                    className={`flex-1 py-2 text-xs font-medium rounded border ${newTaskPriority === p ? 'bg-indigo-600 text-white border-transparent' : 'bg-[#0e1016] border-white/[0.1] text-gray-400 hover:border-white/[0.2]'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Create Issue</Button>
                    </div>
                </form>
            </Modal>

            {/* Invite Member Modal */}
            < Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Member" >
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Email Address</label>
                        <Input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Send Invite</Button>
                    </div>
                </form>
            </Modal >
        </AppLayout >
    );
};

export default Board;
