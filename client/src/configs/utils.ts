export const capitalizeString = (str) => {
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