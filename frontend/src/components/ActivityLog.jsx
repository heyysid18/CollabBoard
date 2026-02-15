import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { History, User } from 'lucide-react';

const ActivityLog = ({ boardId }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`http://localhost:5001/api/activities/${boardId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActivities(data);
            } catch (error) {
                console.error('Failed to fetch activities', error);
            } finally {
                setLoading(false);
            }
        };

        if (boardId) {
            fetchActivities();
        }
    }, [boardId]);

    if (loading) {
        return <div className="p-4 text-center text-gray-500 text-sm">Loading activity...</div>;
    }

    if (activities.length === 0) {
        return <div className="p-4 text-center text-gray-500 text-sm">No recent activity</div>;
    }

    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
            {activities.map((activity) => (
                <div key={activity._id} className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300">
                            <span className="font-semibold text-white mr-1">{activity.user?.username || 'Unknown User'}</span>
                            {activity.details}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <History className="w-3 h-3" />
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityLog;
