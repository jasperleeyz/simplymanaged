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
    const filterArray = filter.split("),");

    filterArray.forEach((filterItem) => {
      // remove last ')' character
      filterItem = filterItem.replace(")", "");
      // split filter info by '('
      const filterItemArray = filterItem.split("(");

      const filterPair = filterItemArray[1].split(",");


      // add to sort object
      filterObject = { ...filterObject, [filterPair[0]]: { [filterItemArray[0]]: filterPair[1].toLocaleUpperCase() } };
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


export const generateResultJson = (data: any, total?: any, page?: any, size?: any) => {
  const result = {
    data: data,
  } as any;

  if (page && size) {
    result["page"] = Number(page);
    result["totalPages"] = Math.ceil(total / Number(size));
    result["total"] = total;
  }

  return result;
}