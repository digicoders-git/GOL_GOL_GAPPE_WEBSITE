import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAvailableProducts = async () => {
    return axios.get(`${API_URL}/products/available`);
};
