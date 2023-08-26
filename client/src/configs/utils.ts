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