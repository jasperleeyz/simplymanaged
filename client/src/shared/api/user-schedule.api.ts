import { IUserSchedule } from "../model/schedule.model";

export const getUserSchedule = async (
  user_company_id: number,
  user_id: number,
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
): Promise<any> => {
  let url = `/user-schedule/${user_company_id}/${user_id}`;

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

export const getAllUserSchedule = async (
    user_company_id: number,
    start_date: string,
    end_date: string,
    page?: number,
    size?: number,
    sort?: string,
    filter?: string
  ): Promise<any> => {
    let url = `/user-schedule/${user_company_id}/${start_date}/${end_date}`;
  
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

  export const createSchedule = async (schedule: IUserSchedule) => {
    const url = `/user-schedule/create`;
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