import { HttpException } from "@nestjs/common";

import axios, { AxiosInstance } from "axios";

const api = (baseUrl: string, token = ""): AxiosInstance => {
  const api = axios.create();
  api.defaults.baseURL = baseUrl;
  if (token) api.defaults.headers.common = { Authorization: `bearer ${token}` };
  api.interceptors.response.use(
    (res) => res,
    (err) => {
      return Promise.reject(new HttpException(err.response?.data, err.response?.status));
    }
  );

  return api;
};

export const genericHttpConsumer = () => {
  return api("");
};
