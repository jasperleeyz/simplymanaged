import { ILeaveRequest } from "../model/request.model";

export const createLeaveRequest = async (
  companyId: number,
  userId: number,
  leaveRequest: ILeaveRequest
) => {
  const url = `/request/create-leave/${companyId}/${userId}`;

  console.log("request: ", leaveRequest);

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(leaveRequest),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getPersonalRequests = async (
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
) => {
  let url = `/request/personal-request`;

  if (page || size || sort || filter) {
    url += `?`;

    if (page) {
      url += `page=${page}&size=${size}&`;
    }

    if (sort) {
      url += `sort=${sort}&`;
    }

    if (filter) {
      url += `filter=${filter}&`;
    }
  }

  if (url.endsWith("&")) {
    url = url.slice(0, -1);
  }

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getRequestById = async (requestId: number) => {
  const url = `/request/personal-request/${requestId}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};