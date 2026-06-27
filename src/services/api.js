import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8080/api', // Tumhara Spring Boot Base URL
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor: Har request se pehle token add karega agar present hai toh
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;