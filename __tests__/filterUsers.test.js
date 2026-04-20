import { filterUsers } from "../src/utils/filterUsers";

describe("filterUsers", () => {
  const users = [
    { id: "1", firstName: "Anna", lastName: "Virtanen" },
    { id: "2", firstName: "Mikko", lastName: "Korhonen" },
    { id: "3", firstName: "Sanna", lastName: "Laine" },
  ];

  test("palauttaa tyhjän listan jos query on tyhjä", () => {
    expect(filterUsers(users, "")).toEqual([]);
  });

  test("yhden kirjaimen haku käyttää startsWith-logiikkaa", () => {
    const result = filterUsers(users, "a");
    expect(result).toEqual([
      { id: "1", firstName: "Anna", lastName: "Virtanen" },
    ]);
  });

  test("pidempi haku käyttää includes-logiikkaa", () => {
    const result = filterUsers(users, "kor");
    expect(result).toEqual([
      { id: "2", firstName: "Mikko", lastName: "Korhonen" },
    ]);
  });

  test("palauttaa tyhjän listan jos osumia ei ole", () => {
    expect(filterUsers(users, "zzzz")).toEqual([]);
  });
});