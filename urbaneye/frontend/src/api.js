// src/api.js
// Automatically uses the correct backend URL based on environment
const API_BASE =
  process.env.REACT_APP_API_URL || 'https://urbaneye-xyww.onrender.com';

export default API_BASE;
