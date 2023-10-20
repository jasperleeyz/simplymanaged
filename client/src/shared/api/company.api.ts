import { ICompany } from "../model/company.model";

export const getCompanyById = async (companyId: number): Promise<any> => {
  return await fetch(`/company/${companyId}`, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const updateCompany = async (
  company: ICompany
): Promise<any> => {
  return await fetch(`/company/update/${company.id}`, {
    method: "POST",
    body: JSON.stringify(company),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
}