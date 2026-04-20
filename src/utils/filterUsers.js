export function filterUsers(listOfUsers, query) {
  if (!query || query.trim() === "") {
    return [];
  }

  const formattedQuery = query.toLowerCase();

  if (formattedQuery.length === 1) {
    return listOfUsers.filter(
      (user) =>
        user.firstName?.toLowerCase().startsWith(formattedQuery) ||
        user.lastName?.toLowerCase().startsWith(formattedQuery)
    );
  }

  return listOfUsers.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(formattedQuery) ||
      user.lastName?.toLowerCase().includes(formattedQuery)
  );
}