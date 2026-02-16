import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './Input';

export const SearchBar = ({ onSearch, placeholder = "Search...", initialValue = "" }) => {
    const [query, setQuery] = useState(initialValue);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query, onSearch]);

    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
                className="pl-9 pr-8 w-full bg-[#0e1016] border border-white/[0.08] focus:border-indigo-500/50"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};
