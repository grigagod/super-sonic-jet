import axios from "axios";
import { endpoint } from "./constants";

export const getAuthAxios = () =>
  axios.create({
    baseURL: endpoint,
    headers: {
      Authorization: `Token ${localStorage.getItem("token")}`,
    },
  });
