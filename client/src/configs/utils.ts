import { PATHS, ROLES } from "./constants";

export const capitalizeString = (str) => {
  if(str == null || str == undefined) return str
  return str
    .split(" ")
    .map((element) => {
      return (
        element.charAt(0).toUpperCase() + element.substring(1).toLowerCase()
      );
    })
    .join(" ");
};

export const isNumber = (value) => {
  return !isNaN(value);
}

export const validEmail = (value) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value)
}

export const validName = (value) => {
  const nameRegex = /^[a-zA-Z\s]+$/
  return nameRegex.test(value)
}

export const getHomeLink = (role: string) => {
  if (role == ROLES.SUPERADMIN) {
    return `/${PATHS.REGISTRATION}/${PATHS.VIEW_REGISTRATION}`;
  } else if (role == ROLES.SYSADMIN) {
    return `/${PATHS.COMPANY}`;
  } else {
    return "/";
  }
};