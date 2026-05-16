// src/api.js
// Automatically uses the correct backend URL based on environment
const API_BASE =
  process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default API_BASE;
