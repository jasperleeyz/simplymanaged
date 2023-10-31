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

  export const createRosterTemplate = async (schedule: IRosterTemplate) => {
    const url = `/roster/create/roster-template`;
    console.log(schedule)
    return await fetch(url, {
      method: "POST",
      body: JSON.stringify(schedule),
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  }