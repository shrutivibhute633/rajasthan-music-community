import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BE_URL, // Replace with your backend URL
  withCredentials: true, 
  // Include credentials with requests
});


export default API;
