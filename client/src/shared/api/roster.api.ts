

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