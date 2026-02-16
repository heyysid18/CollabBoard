import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { History, User, Activity as ActivityIcon, Loader2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const ActivityLog = ({ boardId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const socket = useSocket();
    const listRef = useRef(null);

    const fetchActivities = async (currentPage, isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`http://localhost:5001/api/activities/${boardId}?page=${currentPage}&limit=20`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (isLoadMore) {
                setActivities(prev => [...prev, ...data.activities]);
            } else {
                setActivities(data.activities);
            }

            setHasMore(data.currentPage < data.totalPages);
        } catch (error) {
            console.error('Failed to fetch activities', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        if (boardId) {
            setPage(1);
            fetchActivities(1);
        }
    }, [boardId]);

    useEffect(() => {
        if (!socket) return;

        const handleNewActivity = (newActivity) => {
            // Only add if it belongs to this board (double check)
            if (newActivity.board === boardId || newActivity.board._id === boardId) {
                setActivities(prev => [newActivity, ...prev]);
            }
        };

        socket.on('activity_created', handleNewActivity);

        return () => {
            socket.off('activity_created', handleNewActivity);
        };
    }, [socket, boardId]);

    const handleScroll = (e) => {
        const { scrollTop, clientHeight, scrollHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchActivities(nextPage, true);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading activity...</span>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-gray-500 opacity-60">
                <ActivityIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">No recent activity</span>
            </div>
        );
    }

    return (
        <div
            className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar p-4"
            onScroll={handleScroll}
            ref={listRef}
        >
            <div className="relative border-l border-white/[0.1] ml-3 pb-2 space-y-6">
                {activities.map((activity, index) => (
                    <div key={activity._id || index} className="relative pl-6 group">
                        {/* Timeline Dot */}
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1e2129] border border-gray-600 group-hover:border-indigo-500 group-hover:bg-indigo-500 transition-colors"></div>

                        <div className="flex flex-col gap-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="text-sm text-gray-300 leading-snug">
                                    <span className="font-semibold text-white mr-1.5 hover:text-indigo-400 transition-colors cursor-default">
                                        {activity.user?.username || 'Unknown'}
                                    </span>
                                    {activity.details}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-gray-500 flex items-center gap-1 bg-white/[0.03] px-1.5 py-0.5 rounded">
                                    <History className="w-2.5 h-2.5" />
                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                </span>
                                {activity.targetModel && (
                                    <span className="text-[9px] uppercase tracking-wider text-gray-600 font-medium border border-white/[0.05] px-1 rounded">
                                        {activity.targetModel}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loadingMore && (
                    <div className="flex justify-center pt-2 pl-4">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLog;
