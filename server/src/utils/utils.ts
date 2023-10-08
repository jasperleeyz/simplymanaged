const extractSortObject = (sort: string) => {
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

const extractFilterObject = (filter: string) => {
  let filterObject = {};
  if (filter) {
    // split filter by comma
    const filterArray = filter.split(",");

    filterArray.forEach((filterItem) => {
      // remove last ')' character
      filterItem = filterItem.replace(")", "");
      // split order and sort info by '('
      const filterItemArray = filterItem.split("(");
      // add to sort object
      filterObject = { ...filterObject, [filterItemArray[0]]: filterItemArray[1].toLocaleUpperCase() };
    });
  }
  return filterObject;
}

export const generateFindObject = (page: any, size: any, sort: any, filter: any) => {
  const sortObject = extractSortObject(sort as string);

  const findObject = {
    orderBy: sortObject,
  } as any;

  if (page && size) {
    findObject.skip = (Number(page) - 1) * Number(size);
    findObject.take = Number(size);
  }

  if (filter) {
    findObject.where = extractFilterObject(filter as string);
  }

  return findObject;
}


export const generateResultJson = (page: any, size: any, data: any) => {
  const result = {
    data: data[1],
  } as any;

  if (page && size) {
    result["page"] = Number(page);
    result["totalPages"] = Math.ceil(data[0] / Number(size));
    result["total"] = data[0];
  }

  return result;
}