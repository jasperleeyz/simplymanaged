import { IRosterTemplate } from "../model/schedule.model";

export const getRosterById = async (companyId: number, rosterId: number): Promise<any> => {
    return await fetch(`/roster/${companyId}/${rosterId}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  };

  export const createRosterTemplate = async (rosterTemplate: IRosterTemplate) => {
    const url = `/roster/create/roster-template`;
    return await fetch(url, {
      method: "POST",
      body: JSON.stringify(rosterTemplate),
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  }

  export const getRosterTemplate = async (companyId: number): Promise<any> => {
    return await fetch(`/roster/get-roster-template/${companyId}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  };

  export const getRosterTemplatePosition = async (companyId: number, roster_template_id: number): Promise<any> => {
    return await fetch(`/roster/get-roster-template-positions/${companyId}/${roster_template_id}`, {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  };

  export const deleteRosterTemplate = async (rosterTemplate: IRosterTemplate): Promise<any> => {
    console.log(JSON.stringify(rosterTemplate))
    return await fetch(`/roster/delete/roster-template`, {
      method: "DELETE",
      body: JSON.stringify(rosterTemplate),
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  };