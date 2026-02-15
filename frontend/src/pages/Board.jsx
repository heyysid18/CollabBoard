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
import { Plus, Users, Star, MoreHorizontal, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Board = () => {
    const { id } = useParams();
    const socket = useSocket();
    const [board, setBoard] = useState(null);
    const [lists, setLists] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals state
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [activeListId, setActiveListId] = useState(null);
    const [inviteEmail, setInviteEmail] = useState('');

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
                        <div className="relative hidden md:block w-48">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                            <Input
                                className="w-full bg-[#0e1016] border border-white/[0.08] rounded pl-8 pr-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 placeholder:text-gray-600 cursor-pointer"
                                placeholder="Filter tasks..."
                                readOnly
                                onClick={() => setIsSearchModalOpen(true)}
                            />
                        </div>
                        <div className="h-4 w-[1px] bg-white/[0.1] hidden md:block"></div>
                        {/* ... */}
                    </div>
                </header>

                {/* ... Board Canvas ... */}

                {/* Invite Member Modal */}
                <Modal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite Member">
                    <form onSubmit={handleInvite} className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">Email Address</label>
                            <Input
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                type="email"
                                autoFocus
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsInviteModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Send Invite</Button>
                        </div>
                    </form>
                </Modal>

                {/* Board Canvas */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden">
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

                        {/* Add List Button (Canvas) */}
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
                </main>
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
        </AppLayout>
    );
};

export default Board;
