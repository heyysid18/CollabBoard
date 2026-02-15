import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Loader, List, CheckCircle } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

const TaskSearch = ({ boardId, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalTasks, setTotalTasks] = useState(0);

    const searchTasks = async (reset = false) => {
        if (!query.trim()) return;

        const currentPage = reset ? 1 : page;
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`http://localhost:5001/api/tasks`, {
                params: { boardId, search: query, page: currentPage, limit: 5 },
                headers: { Authorization: `Bearer ${token}` }
            });

            setResults(reset ? data.tasks : [...results, ...data.tasks]);
            setTotalPages(data.totalPages);
            setTotalTasks(data.totalTasks);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query) searchTasks(true);
        }, 500);
        return () => clearTimeout(timeout);
    }, [query]);

    const loadMore = () => {
        setPage(prev => prev + 1);
        searchTasks(); // Need to handle state update delay, but simplified for now
    };

    // Effect for pagination trigger (simplified)
    useEffect(() => {
        if (page > 1) searchTasks();
    }, [page]);

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                    placeholder="Search tasks by title..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="min-h-[200px] max-h-[400px] overflow-y-auto custom-scrollbar">
                {loading && page === 1 && (
                    <div className="flex justify-center py-8">
                        <Loader className="w-6 h-6 animate-spin text-indigo-500" />
                    </div>
                )}

                {!loading && query && results.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No tasks found matching "{query}"
                    </div>
                )}

                <div className="space-y-2">
                    {results.map(task => (
                        <div key={task._id} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-lg hover:border-indigo-500/30 transition-colors group cursor-pointer">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-200 group-hover:text-white">{task.title}</h4>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border border-white/10 ${task.priority === 'High' ? 'text-rose-400 bg-rose-500/10' :
                                                task.priority === 'Medium' ? 'text-amber-400 bg-amber-500/10' :
                                                    'text-emerald-400 bg-emerald-500/10'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                            <List className="w-3 h-3" /> List View
                                        </span>
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-600">
                                    {new Date(task.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {results.length > 0 && results.length < totalTasks && (
                    <div className="pt-2 text-center">
                        <Button variant="ghost" size="sm" onClick={loadMore} disabled={loading}>
                            {loading ? 'Loading...' : 'Load More results'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskSearch;
