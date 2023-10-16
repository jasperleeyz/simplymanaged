import { IDepartment } from "../model/company.model";

export const getAllDepartments = async (
  company_id: number,
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
): Promise<any> => {
  let url = `/department/${company_id}`;

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

export const createUpdateDepartment = async (
  department: IDepartment
): Promise<any> => {
  const url = `/department/create-update`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(department),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};
