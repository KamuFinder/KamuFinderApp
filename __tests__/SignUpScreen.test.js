import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUpScreen from "../src/screens/SignUpScreen";

const mockNavigate = jest.fn();
const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSetDoc = jest.fn();
const mockDoc = jest.fn();
const mockCollection = jest.fn();
const mockWhere = jest.fn();
const mockQuery = jest.fn();
const mockGetDocs = jest.fn();

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    dispatch: jest.fn(),
  }),
  CommonActions: {
    reset: jest.fn(),
  },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("react-native-keyboard-aware-scroll-view", () => ({
  KeyboardAwareScrollView: ({ children }) => children,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock("../src/styles/SignIn_And_Up.js", () => ({}));
jest.mock("../assets/Logo.png", () => "mock-logo", { virtual: true });

jest.mock("../src/firebase/config.js", () => ({
  auth: {},
  firestore: {},
  USERS: "users",
  createUserWithEmailAndPassword: (...args) =>
    mockCreateUserWithEmailAndPassword(...args),
  setDoc: (...args) => mockSetDoc(...args),
  doc: (...args) => mockDoc(...args),
  where: (...args) => mockWhere(...args),
  query: (...args) => mockQuery(...args),
  collection: (...args) => mockCollection(...args),
}));

jest.mock("firebase/firestore", () => ({
  getDocs: (...args) => mockGetDocs(...args),
}));

describe("SignUpScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
    mockCollection.mockReturnValue("collection-ref");
    mockWhere.mockReturnValue("where-ref");
    mockQuery.mockReturnValue("query-ref");
    mockDoc.mockReturnValue("doc-ref");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("näyttää virheen jos sähköposti puuttuu", async () => {
    const { getByText } = render(<SignUpScreen />);

    fireEvent.press(getByText("Rekisteröidy"));

    expect(Alert.alert).toHaveBeenCalledWith("Virhe", "Sähköposti on pakollinen");
  });

  test("näyttää virheen jos sähköposti on virheellinen", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi");
    fireEvent.changeText(getByPlaceholderText("Anna etunimi"), "Anni");
    fireEvent.changeText(getByPlaceholderText("Anna sukunimi"), "Testaaja");
    fireEvent.changeText(getByPlaceholderText("Syötä nimimerkki:"), "anni");
    fireEvent.changeText(getByPlaceholderText("Kirjoita salasana"), "Testi123");
    fireEvent.changeText(getByPlaceholderText("Anna salasana uudelleen"), "Testi123");

    fireEvent.press(getByText("Rekisteröidy"));

    expect(Alert.alert).toHaveBeenCalledWith("Virhe", "Sähköposti on virheellinen");
  });

  test("näyttää virheen jos salasanat eivät täsmää", async () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi@testi.com");
    fireEvent.changeText(getByPlaceholderText("Anna etunimi"), "Anni");
    fireEvent.changeText(getByPlaceholderText("Anna sukunimi"), "Testaaja");
    fireEvent.changeText(getByPlaceholderText("Syötä nimimerkki:"), "anni");
    fireEvent.changeText(getByPlaceholderText("Kirjoita salasana"), "Testi123");
    fireEvent.changeText(getByPlaceholderText("Anna salasana uudelleen"), "Testi124");

    fireEvent.press(getByText("Rekisteröidy"));

    expect(Alert.alert).toHaveBeenCalledWith("Virhe", "Salasanat eivät täsmää");
  });

  test("näyttää virheen jos nimimerkki on jo käytössä", async () => {
    mockGetDocs.mockResolvedValue({
      empty: false,
    });

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi@testi.com");
    fireEvent.changeText(getByPlaceholderText("Anna etunimi"), "Anni");
    fireEvent.changeText(getByPlaceholderText("Anna sukunimi"), "Testaaja");
    fireEvent.changeText(getByPlaceholderText("Syötä nimimerkki:"), "anni");
    fireEvent.changeText(getByPlaceholderText("Kirjoita salasana"), "Testi123");
    fireEvent.changeText(getByPlaceholderText("Anna salasana uudelleen"), "Testi123");

    fireEvent.press(getByText("Rekisteröidy"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Virhe", "Nimimerkki on jo käytössä");
    });

    expect(mockCreateUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test("rekisteröi käyttäjän onnistuneesti", async () => {
    mockGetDocs.mockResolvedValue({
      empty: true,
    });

    mockCreateUserWithEmailAndPassword.mockResolvedValue({
      user: { uid: "user-123" },
    });

    mockSetDoc.mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi@testi.com");
    fireEvent.changeText(getByPlaceholderText("Anna etunimi"), "Anni");
    fireEvent.changeText(getByPlaceholderText("Anna sukunimi"), "Testaaja");
    fireEvent.changeText(getByPlaceholderText("Syötä nimimerkki:"), "anni");
    fireEvent.changeText(getByPlaceholderText("Kirjoita salasana"), "Testi123");
    fireEvent.changeText(getByPlaceholderText("Anna salasana uudelleen"), "Testi123");

    fireEvent.press(getByText("Rekisteröidy"));

    await waitFor(() => {
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
        {},
        "testi@testi.com",
        "Testi123"
      );
    });

    expect(mockSetDoc).toHaveBeenCalledWith(
      "doc-ref",
      expect.objectContaining({
        firstName: "Anni",
        lastName: "Testaaja",
        nickName: "anni",
        email: "testi@testi.com",
        failedLoginAttempts: 0,
        lockUntil: null,
      })
    );
  });
});