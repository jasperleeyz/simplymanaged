export const extractSortObject = (sort: string) => {
  let sortObject = {};
  if (sort) {
    // split sort by comma
    const sortArray = sort.split(",");

    sortArray.forEach((sortItem) => {
      // remove last ')' character
      sortItem = sortItem.replace(")", "");
      // split order and sort info by '('
      const sortItemArray = sortItem.split("(");
      // add to sort object
      sortObject = { ...sortObject, [sortItemArray[1]]: sortItemArray[0] };
    });
  }
  return sortObject;
};
