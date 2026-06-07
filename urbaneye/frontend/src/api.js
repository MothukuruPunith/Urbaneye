const RAW = process.env.REACT_APP_API_URL || 'https://urbaneye-xyww.onrender.com';
const API_BASE = RAW.endsWith('/') ? RAW.slice(0, -1) : RAW;
export default API_BASE;
