const { default: axios } = require("axios");

const serverSideApiUrl =
  "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local/api/";

const headerOptions = {
  "Content-Type": "application/json",
};

export const axiosClient = axios.create({
  headers: headerOptions,
  baseURL: "https://ticketing.dev/api/",
});

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    return axios.create({
      headers: { ...req.headers, ...headerOptions },
      baseURL: serverSideApiUrl,
    });
  } else {
    return axiosClient;
  }
};

export default buildClient;
