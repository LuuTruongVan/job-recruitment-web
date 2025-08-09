import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:3000', // Thay bằng cổng thực tế của server backend
});

export default instance;