import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';

const BoardCard = ({ board }) => {
    return (
        <Link to={`/board/${board._id}`} className="block">
            <div className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-100 card-shadow h-full flex flex-col">
                <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate">{board.title}</h3>
                <div className="mt-auto flex items-center text-gray-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </Link>
    );
};

export default BoardCard;
