import { IRegistration } from "../model/company.model";

export const getAllRegistrations = async (
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
): Promise<any> => {
  let url = `/registration`;

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
      else return Promise.reject(response.statusText);
    })
    .catch((err) => Promise.reject(err));
};

export const updateRegistration = async (registration: IRegistration) => {
  const url = `/registration/update`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(registration),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return Promise.reject(response.statusText);
    })
    .catch((err) => Promise.reject(err));
};

export const getRegistrationById = async (id: number) => {
  const url = `/registration/${id}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return Promise.reject(response.statusText);
    })
    .catch((err) => Promise.reject(err));
};

export const submitRegistration = async (registration: IRegistration) => {
  const url = `/registration`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(registration),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return Promise.reject(response.statusText);
    })
    .catch((err) => Promise.reject(err));
}