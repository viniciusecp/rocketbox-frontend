import axios from "axios";

const api = axios.create({
  baseURL: "https://rocketbox-b.herokuapp.com"
});

export default api;
