import IUser from "../model/user.model";

export const getAllEmployees = async (
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
): Promise<any> => {
  let url = `/user`;

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

export const addEmployee = async (user: IUser): Promise<any> => {
  return await fetch(`/user/create`, {
    method: "POST",
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const updateEmployee = async (user: IUser): Promise<any> => {
  return await fetch(`/user/update`, {
    method: "POST",
    body: JSON.stringify(user),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getEmployeeById = async (userId: number): Promise<any> => {
  const url = `/user/${userId}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const forgetPassword = async ({
  email,
}: {
  email: string;
}): Promise<any> => {
  return await fetch(`/forget-password`, {
    method: "POST",
    body: JSON.stringify({ email }),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const resetPasswordVerify = async (token: string): Promise<any> => {
  return await fetch(`/reset-password/${token}`, {
    method: "POST",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const resetPassword = async ({
  user,
  password,
  confirm_password,
}: {
  user: any;
  password: string;
  confirm_password: string;
}): Promise<any> => {
  return await fetch(`/reset-password`, {
    method: "POST",
    body: JSON.stringify({ user, password, confirm_password }),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};
