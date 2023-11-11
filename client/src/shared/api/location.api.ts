import { ICompanyLocation } from "../model/company.model";

export const getAllLocations = async (
  company_id: number,
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
): Promise<any> => {
  let url = `/location/${company_id}`;

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

export const getLocationById = async (
  company_id: number,
  location_id: number
): Promise<any> => {
  const url = `/location/${company_id}/${location_id}`;
  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
}

export const createUpdateLocation = async (
  location: ICompanyLocation
): Promise<any> => {
  return await fetch(`/location/create-update`, {
    method: "POST",
    body: JSON.stringify(location),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};
