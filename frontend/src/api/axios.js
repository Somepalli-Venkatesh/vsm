import axios from "axios";
export default axios.create({
  baseURL: "https://vsm-virtual-study-backend.onrender.com/api",
  //  baseURL: "http://localhost:5000/api",
});
