import { IRoster, IRosterTemplate } from "../model/schedule.model";

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

  export const deleteRoster = async (rosterTemplate: IRoster): Promise<any> => {
    console.log(JSON.stringify(rosterTemplate))
    return await fetch(`/roster/delete/roster`, {
      method: "DELETE",
      body: JSON.stringify(rosterTemplate),
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  };

  export const createRoster = async (roster: IRoster) => {
    const url = `/roster/create/roster`;
    return await fetch(url, {
      method: "POST",
      body: JSON.stringify(roster),
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  }

  export const getRosterFromAndTo = async (
    companyId: number,
    from: Date = new Date(),
    to: Date,
  ) => {
    let url = `/roster/get-roster-from-to/${companyId}?from=${from.toISOString()}`;
    if (to) {
      url += `&to=${to.toISOString()}`;
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

  export const updateRoster = async (roster: IRoster) => {
    const url = `/roster/update/roster`;
    return await fetch(url, {
      method: "POST",
      body: JSON.stringify(roster),
    })
      .then((response) => {
        if (response.ok) return Promise.resolve(response.json());
        else return response.text().then((text) => Promise.reject(text));
      })
      .catch((err) => Promise.reject(err));
  }