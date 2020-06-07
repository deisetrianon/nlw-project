import axios from 'axios';

// TIP: change image_url 'localhost' to the IP address when testing the mobile app
const api = axios.create({
    baseURL: 'http://localhost:3333'
});

export default api;
