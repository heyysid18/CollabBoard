const dotenv = require('dotenv');

dotenv.config();

const testApi = async () => {
    try {
        const baseUrl = 'http://localhost:5001/api';

        // Helper for fetch
        const request = async (endpoint, method = 'GET', body = null, token = null) => {
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const options = { method, headers };
            if (body) options.body = JSON.stringify(body);

            const res = await fetch(`${baseUrl}${endpoint}`, options);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || res.statusText);
            return data;
        };

        const username = `debug_${Date.now()}`;
        const email = `${username}@example.com`;
        const password = 'password123';

        console.log('Registering user...', username);
        const authData = await request('/auth/register', 'POST', { username, email, password });
        const token = authData.token;
        const userId = authData._id;
        console.log('Got token for user:', userId);

        // 2. Create a Board
        console.log('Creating board...');
        const boardData = await request('/boards', 'POST', { title: 'Debug Board' }, token);
        const boardId = boardData._id;
        console.log('Board created:', boardId);

        // 3. Create List
        console.log('Creating list...');
        const listData = await request('/lists', 'POST', { title: 'Debug List', boardId }, token);
        const listId = listData._id;

        // 6. Fetch Board details (The failing API)
        console.log('Fetching board details...');
        const detailData = await request(`/boards/${boardId}`, 'GET', null, token);

        console.log('Board Response Structure:');
        console.log(JSON.stringify(detailData, null, 2));

    } catch (error) {
        console.error('API Test Failed:', error);
    }
};

testApi();
