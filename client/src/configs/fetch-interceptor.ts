import { API_URL } from "./constants";

const originalFetch = window.fetch;
window.fetch = async function (...args) {
  // eslint-disable-next-line prefer-const
  let [url, options] = args;

  // request interceptor
  if(!url.toString().includes(API_URL)) {
    url = `${API_URL}${url}`; // intercept request and add base url
  }

  // intercept request and add headers
  const token =
    sessionStorage.getItem("bearerToken") ||
    localStorage.getItem("bearerToken") ||
    "";
  if (options) {
    options.headers = {
      ...options.headers,
      "Content-Type": "application/json",
    };

    if (token && token !== "") {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  try {
    // call original `fetch()` with intercepted request
    const response = await originalFetch(url, options);

    if (response.status === 401) {
      sessionStorage.removeItem("bearerToken");
      window.location.href = "/login?q=timeout";
    }

    // response interceptor
    return response;
  } catch (error) {
    return new Response(
      "Internal Server Error. Please contact your system admin.", {
      status: 500,
      statusText: "Internal Server Error",
    });
  }
};
