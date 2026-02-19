import axios from "axios";

const API = axios.create({
  baseURL: "http://10.19.6.132:5000/api",
});

export default API;
