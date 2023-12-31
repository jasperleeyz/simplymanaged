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
      const [filterCondition, filterCriteriaString] = filterItem.split("(");
      // split filter pair by first ','
      const [filterColumn, ...filterCriteria] = filterCriteriaString.split(",");
      const filterCriterias = filterCriteria.map((filterCriteria) => {
        filterCriteria = filterCriteria
          .replace("[", "")
          .replace("]", "")
          .toLocaleUpperCase();
        return filterCriteria;
      });
      // add to sort object
      filterObject = {
        ...filterObject,
        [filterColumn]: {
          [filterCondition]:
            filterCondition === "in" || filterCondition === "notIn"
              ? filterCriterias
              : filterColumn === "id"
              ? Number(filterCriterias[0])
              : filterCriterias[0],
        },
      };
    });
  }
  return filterObject;
};

export const generateFindObject = (
  page: any,
  size: any,
  sort: any,
  filter: any
) => {
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
};

export const generateResultJson = (
  data: any,
  total?: any,
  page?: any,
  size?: any
) => {
  const result = {
    data: data,
  } as any;

  if (page && size) {
    result["page"] = Number(page);
    result["totalPages"] = Math.ceil(total / Number(size)) || 1;
    result["total"] = total;
  }

  return result;
};
