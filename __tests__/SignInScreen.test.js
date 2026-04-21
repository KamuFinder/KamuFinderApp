import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignInScreen from "../src/screens/SignInScreen";

const mockNavigate = jest.fn();
const mockLoginUser = jest.fn();
const mockIncrementFailedLogin = jest.fn();
const mockResetFailedLogin = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSendPasswordResetEmail = jest.fn();
const mockGetAuth = jest.fn(() => ({}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "Ionicons",
}));

jest.mock("../src/styles/SignIn_And_Up.js", () => ({}));

jest.mock("../src/firebase/config.js", () => ({
  getAuth: () => mockGetAuth(),
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  sendPasswordResetEmail: (...args) => mockSendPasswordResetEmail(...args),
}));

jest.mock("firebase/functions", () => ({
  getFunctions: jest.fn(() => "mock-functions"),
  httpsCallable: jest.fn((functions, name) => {
    if (name === "loginUser") return mockLoginUser;
    if (name === "incrementFailedLogin") return mockIncrementFailedLogin;
    if (name === "resetFailedLogin") return mockResetFailedLogin;
    return jest.fn();
  }),
}));

describe("SignInScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("kirjautuu onnistuneesti oikeilla tunnuksilla", async () => {
    mockLoginUser.mockResolvedValue({
      data: { locked: false },
    });

    mockSignInWithEmailAndPassword.mockResolvedValue({
      user: { uid: "123" },
    });

    mockResetFailedLogin.mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), " Testi@Testi.com ");
    fireEvent.changeText(getByPlaceholderText("Syötä salasana"), "salasana123");
    fireEvent.press(getByText("Kirjaudu sisään"));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith({
        email: "testi@testi.com",
      });
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      "testi@testi.com",
      "salasana123"
    );

    expect(mockResetFailedLogin).toHaveBeenCalledWith({
      email: "testi@testi.com",
    });
  });

  test("näyttää virheen jos tili on lukittu", async () => {
    mockLoginUser.mockResolvedValue({
      data: { locked: true },
    });

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi@testi.com");
    fireEvent.changeText(getByPlaceholderText("Syötä salasana"), "salasana123");
    fireEvent.press(getByText("Kirjaudu sisään"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Tili lukittu", "Yritä myöhemmin");
    });

    expect(mockSignInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test("näyttää virheen väärällä salasanalla", async () => {
    mockLoginUser.mockResolvedValue({
      data: { locked: false },
    });

    const error = new Error("wrong password");
    error.code = "auth/wrong-password";

    mockSignInWithEmailAndPassword.mockRejectedValue(error);
    mockIncrementFailedLogin.mockResolvedValue({});

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi@testi.com");
    fireEvent.changeText(getByPlaceholderText("Syötä salasana"), "väärä");
    fireEvent.press(getByText("Kirjaudu sisään"));

    await waitFor(() => {
      expect(mockIncrementFailedLogin).toHaveBeenCalledWith({
        email: "testi@testi.com",
      });
    });

    expect(Alert.alert).toHaveBeenCalledWith("Virhe", "Sähköposti tai salasana väärin");
  });

  test("unohtunut salasana ilman sähköpostia näyttää virheen", async () => {
    const { getByText } = render(<SignInScreen />);

    fireEvent.press(getByText("Unohtuiko salasana?"));

    expect(Alert.alert).toHaveBeenCalledWith("Virhe", "Syötä sähköpostiosoite ensin");
  });

  test("salasanan palautus avaa vahvistuksen", async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);

    fireEvent.changeText(getByPlaceholderText("Syötä sähköposti"), "testi@testi.com");
    fireEvent.press(getByText("Unohtuiko salasana?"));

    expect(Alert.alert).toHaveBeenCalledWith(
      "Palauta salasana",
      expect.stringContaining("testi@testi.com"),
      expect.any(Array)
    );
  });
});