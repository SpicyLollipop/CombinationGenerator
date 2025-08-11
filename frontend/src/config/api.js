import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Laravel backend default port
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

export const saveParameters = (parameters, values) =>
    api.post('/save-parameters', { parameters, values });

export const getParameters = () =>
    api.get('/get-parameters');

export const getParameterValues = (id) =>
    api.get(`/parameters/${id}`);

export default api; 