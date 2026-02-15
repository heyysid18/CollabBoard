import React, { useState } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical, Plus, User as UserIcon, Trash2 } from 'lucide-react';
import { cn } from '../utils/cn';
import Modal from './ui/Modal';
import { Button } from './ui/Button';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

// ... inside TaskCard component ...
const TaskCard = ({ task, index, boardMembers = [], onDelete }) => {
    // ... existing state ...
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedAssignees, setSelectedAssignees] = useState(task.assignees ? task.assignees.map(u => u._id || u) : []);
    const socket = useSocket();

    const priorityStyles = {
        Low: 'text-green-400 border-green-400/20 bg-green-400/10',
        Medium: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
        High: 'text-red-400 border-red-400/20 bg-red-400/10'
    };

    const toggleAssignee = (userId) => {
        setSelectedAssignees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/tasks/${task._id}/assign`, {
                assignees: selectedAssignees
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Assignees updated');
            setIsAssignModalOpen(false);
            // Socket emission is handled by backend, so we just wait for update or optimistic UI
        } catch (error) {
            console.error(error);
            toast.error('Failed to assign users');
        }
    };
    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <>
            <Draggable draggableId={task._id} index={index}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{ ...provided.draggableProps.style }}
                        className={cn(
                            "group relative bg-[#20232b] hover:bg-[#252830] border border-white/[0.06] rounded-md p-3 shadow-sm transition-all select-none",
                            snapshot.isDragging ? "shadow-xl ring-1 ring-indigo-500/50 rotate-1 z-50 bg-[#252830]" : ""
                        )}
                    >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                            <span className="text-[13px] text-[#ededef] font-medium leading-snug">{task.title}</span>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={handleDelete}
                                    className="text-gray-600 hover:text-red-400 p-0.5"
                                    title="Delete Task"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <GripVertical className="w-3.5 h-3.5 text-gray-600 cursor-grab flex-shrink-0" />
                            </div>
                        </div>

                        {/* ... rest of the card ... */}

                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider",
                                    priorityStyles[task.priority] || priorityStyles.Medium
                                )}>
                                    {task.priority || 'Medium'}
                                </div>
                            </div>

                            {/* Assignees */}
                            <div className="flex items-center -space-x-1.5">
                                {task.assignees && task.assignees.filter(Boolean).map(user => {
                                    // Handle case where user is just an ID string (not populated)
                                    const username = user.username || 'Unknown';
                                    const initial = username.charAt(0).toUpperCase();
                                    return (
                                        <div key={user._id || user} className="w-5 h-5 rounded-full bg-indigo-500 border border-[#20232b] flex items-center justify-center text-[8px] font-bold text-white z-10" title={username}>
                                            {initial}
                                        </div>
                                    );
                                })}

                                {/* Assign Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // prevent drag?
                                        setIsAssignModalOpen(true);
                                    }}
                                    className="w-5 h-5 rounded-full bg-[#2a2e37] border border-[#3f4350] border-dashed flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-400 transition-colors z-20"
                                    title="Assign User"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Draggable>

            {/* Assignment Modal */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Users">
                <form onSubmit={handleAssign} className="space-y-4">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar border border-white/[0.06] rounded-md p-2">
                        {boardMembers.length > 0 ? (
                            boardMembers.filter(Boolean).map(member => (
                                <div
                                    key={member._id}
                                    onClick={() => toggleAssignee(member._id)}
                                    className={cn(
                                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                                        selectedAssignees.includes(member._id) ? "bg-indigo-500/20 border border-indigo-500/50" : "hover:bg-white/[0.03] border border-transparent"
                                    )}
                                >
                                    <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-200 font-medium">{member.username}</p>
                                        <p className="text-xs text-gray-500">{member.email}</p>
                                    </div>
                                    {selectedAssignees.includes(member._id) && (
                                        <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white">✓</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500 text-center py-4">No other members in this board.</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Save Assignments</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default TaskCard;
