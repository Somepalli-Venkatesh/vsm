import axios from "axios";
export default axios.create({
  // baseURL: "https://vsm-virtual-study-backend.vercel.app/api",
   baseURL: "http://localhost:5000/api",
});
