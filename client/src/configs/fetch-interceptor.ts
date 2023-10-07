import { API_URL } from "./constants";

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  // eslint-disable-next-line prefer-const
  let [url, options] = args;

  // request interceptor
  console.log("url", url);
  console.log("options", options);

  url = `${API_URL}${url}`;

  if (options) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${sessionStorage.getItem("bearerToken") || ""}`,
    };
  }
  // call original `fetch()` with intercepted request
  const response = await originalFetch(url, options);

  // response interceptor
  return response;
};
