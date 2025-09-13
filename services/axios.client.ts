import axios from "axios";

const AxiosClient = (url: string, headers = {}) => {
  if (!url) {
    throw new Error("URL is required");
  }
  const api = axios.create({
    baseURL: url,
    timeout: 100000,
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      ...headers,
    },
    withCredentials: true,
  });

  api.interceptors.request.use(
    async (config) => {
      return config;
    },
    (error) => Promise.reject(error)
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response && error.response.status === 401) {}

      return Promise.reject(error);
    }
  );

  return api;
};

export default AxiosClient;