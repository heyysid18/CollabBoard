import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import { MoreHorizontal, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';

const ListColumn = ({ list, tasks, onAddTask }) => {
    return (
        <div className="w-[280px] flex-shrink-0 flex flex-col h-full max-h-full">
            {/* List Header */}
            <div className="flex justify-between items-center mb-2 px-2 group min-h-[32px]">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[13px] text-gray-200">{list.title}</h3>
                    <span className="text-[11px] text-gray-500 font-medium">{tasks.length}</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </div>

            {/* Droppable Area */}
            <div className="flex-1 bg-[#16181d] border border-white/[0.04] rounded-lg flex flex-col overflow-hidden max-h-full">
                <Droppable droppableId={list._id}>
                    {(provided, snapshot) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={cn(
                                "flex-1 overflow-y-auto p-2 min-h-[50px] transition-colors custom-scrollbar",
                                snapshot.isDraggingOver ? "bg-white/[0.02]" : ""
                            )}
                        >
                            <div className="flex flex-col gap-2">
                                {tasks.map((task, index) => (
                                    <TaskCard key={task._id} task={task} index={index} />
                                ))}
                            </div>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {/* Add Task Button Footer */}
                <button
                    onClick={() => onAddTask(list._id)}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-300 p-3 text-[13px] font-medium transition-colors hover:bg-white/[0.02] border-t border-white/[0.04] w-full text-left"
                >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Issue</span>
                </button>
            </div>
        </div>
    );
};

export default ListColumn;
