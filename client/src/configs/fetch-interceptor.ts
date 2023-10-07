import { API_URL } from "./constants";

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  // eslint-disable-next-line prefer-const
  let [url, options] = args;

  // request interceptor
  url = `${API_URL}${url}`; // intercept quest and add base url

  // intercept request and add headers
  const token = sessionStorage.getItem("bearerToken") || localStorage.getItem("bearerToken") || "";
  if (options) {
    options.headers = {
      ...options.headers,
      'Content-Type': "application/json",
    };

    if(token && token !== "") {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  // call original `fetch()` with intercepted request
  const response = await originalFetch(url, options);

  // response interceptor
  return response;
};
