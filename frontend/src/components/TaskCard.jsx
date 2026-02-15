import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { GripVertical } from 'lucide-react';
import { cn } from '../utils/cn';

const TaskCard = ({ task, index }) => {
    // Priority badges inspired by Linear
    const priorityStyles = {
        Low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        High: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };

    return (
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
                        {/* Grip handle only shows on hover for cleaner look */}
                        <GripVertical className="w-3.5 h-3.5 text-gray-600 opacity-0 group-hover:opacity-100 cursor-grab flex-shrink-0" />
                    </div>

                    {task.description && (
                        <p className="text-[11px] text-[#a1a1aa] line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <div className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider",
                            priorityStyles[task.priority] || priorityStyles.Medium
                        )}>
                            {task.priority || 'Medium'}
                        </div>

                        <div className="w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-[9px] font-bold">
                            S
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
