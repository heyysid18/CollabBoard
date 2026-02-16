import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AppLayout from '../components/layout/AppLayout';
import { CheckSquare, ExternalLink } from 'lucide-react';

const MyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get('http://localhost:5001/api/tasks/my-tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch my tasks', error);
        } finally {
            setIsLoading(false);
        }
    };

    const priorityStyles = {
        Low: 'text-green-400 border-green-400/20 bg-green-400/10',
        Medium: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10',
        High: 'text-red-400 border-red-400/20 bg-red-400/10'
    };

    return (
        <AppLayout>
            {/* Header */}
            <div className="h-14 border-b border-white/[0.08] flex items-center px-6 bg-[#0e1016]">
                <h1 className="text-sm font-semibold text-white flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    My Assigned Tasks
                </h1>
            </div>

            {/* Content */}
            <div className="p-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : tasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tasks.map(task => (
                            <Link
                                key={task._id}
                                to={`/board/${task.board?._id || task.board}`}
                                className="group bg-[#16181d] border border-white/[0.06] hover:border-blue-500/30 rounded-xl p-5 transition-all hover:shadow-lg hover:shadow-blue-500/5 block relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-2">{task.title}</h3>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase tracking-wider ${priorityStyles[task.priority] || priorityStyles.Medium
                                        }`}>
                                        {task.priority || 'Medium'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
                                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                                        {task.board?.title || 'Unknown Board'}
                                    </div>
                                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-[#16181d] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/[0.06]">
                            <CheckSquare className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-gray-300 font-medium mb-1">No tasks assigned</h3>
                        <p className="text-gray-500 text-sm">Tasks assigned to you will appear here.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
};

export default MyTasks;
