import moment from "moment";
import { IBidRequest, ILeaveRequest, IRequest, ISwapRequest } from "../model/request.model";

export const createLeaveRequest = async (
  companyId: number,
  userId: number,
  leaveRequest: ILeaveRequest
) => {
  const url = `/request/create-leave/${companyId}/${userId}`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(leaveRequest),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getPersonalRequests = async (
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
) => {
  let url = `/request/personal-request`;

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

export const getPersonalRequestById = async (requestId: number) => {
  const url = `/request/personal-request/${requestId}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getAllPendingRequestByDepartmentId = async (
  departmentId: number,
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
) => {
  let url = `/request/pending-request/${departmentId}`;

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

export const getRequestById = async (requestId: number): Promise<any> => {
  const url = `/request/${requestId}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const updateRequest = async (request: IRequest): Promise<any> => {
  const url = `/request/update`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getRemainingLeaveBalance = async (
  leave_type: string
): Promise<any> => {
  const url = `/request/leave-balance?leave_type=${leave_type}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const createSwapRequest = async (request: any): Promise<any> => {
  const url = `/request/create-swap`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getAllRequestPendingManagerApproval = async (
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
) => {
  let url = `/request/pending-request/manager`;

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
}

export const getAllRequestPendingEmployeeApproval = async (
  page?: number,
  size?: number,
  sort?: string,
  filter?: string
) => {
  let url = `/request/pending-request/employee`;

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
}

export const createBidRequest = async (request: any): Promise<any> => {
  const url = `/request/create-bid`;

  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(request),
  })
    .then((response) => {
      if (response.ok) return Promise.resolve(response.json());
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
};

export const getApprovedLeaveFromAndTo = async (
  from: Date,
  to: Date,
): Promise<any> => {
  const url = `/request/approved-leave?from=${moment(from).format("YYYY-MM-DD")}&to=${moment(to).format("YYYY-MM-DD")}`;

  return await fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) return response.json();
      else return response.text().then((text) => Promise.reject(text));
    })
    .catch((err) => Promise.reject(err));
}