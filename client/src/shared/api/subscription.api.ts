export const getSubscriptionModelById = async (id: number): Promise<any> => {
  return await fetch(`/subscription/model/${id}`, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getAllSubscriptionModels = async (): Promise<any> => {
  return await fetch(`/subscription/model/all`, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getSubscriptionModelByCompanyId = async (company_id: number): Promise<any> => {
  return await fetch(`/subscription/model/${company_id}`, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};