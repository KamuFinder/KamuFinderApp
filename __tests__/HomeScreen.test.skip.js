import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import HomeScreen from "../src/screens/HomeScreen";

jest.mock("../src/context/UserContext.js", () => ({
  useUser: () => ({ uid: "current-user-id" }),
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: jest.fn(),
}));

const mockCollection = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock("../src/firebase/config", () => ({
  firestore: {},
  USERS: "users",
  FRIENDREQUESTS: "friendRequests",
  USERSPRIVATECHATS: "usersPrivateChats",
  doc: jest.fn(() => "doc-ref"),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({ firstName: "Anni" }),
    })
  ),
  collection: (...args) => mockCollection(...args),
  onSnapshot: (...args) => mockOnSnapshot(...args),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  setDoc: jest.fn(),
}));

jest.mock("../src/components/FriendRequestButton.js", () => "FriendRequestButton");
jest.mock("../src/components/UserAvatar.js", () => "UserAvatar");
jest.mock("../src/components/Loading.js", () => () => null);

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
  MaterialIcons: "MaterialIcons",
}));

jest.mock("../assets/Logo.png", () => "mock-logo", { virtual: true });

beforeEach(() => {
  jest.clearAllMocks();

  mockCollection.mockImplementation((...args) => args.join("/"));

  mockOnSnapshot.mockImplementation((ref, callback) => {
    const refString = String(ref);

    if (refString === "users") {
      callback({
        docs: [
          {
            id: "current-user-id",
            data: () => ({
              firstName: "Anni",
              lastName: "Tester",
              avatarSeed: "",
              avatarStyle: "",
            }),
          },
          {
            id: "user-2",
            data: () => ({
              firstName: "Anna",
              lastName: "Virtanen",
              avatarSeed: "",
              avatarStyle: "",
            }),
          },
        ],
      });
    } else {
      callback({ docs: [] });
    }

    return () => {};
  });
});

test("HomeScreen renderöityy ja näyttää hakukentän", async () => {
  const { getByPlaceholderText } = render(<HomeScreen />);

  await waitFor(() => {
    expect(getByPlaceholderText("Etsi kaveria nimellä")).toBeTruthy();
  });
});
