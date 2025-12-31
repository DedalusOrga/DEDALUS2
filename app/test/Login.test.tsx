import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Login from "../src/pages/Login";
import { handleLogin } from "../src/infrastructure/api/handleLogin";

// 🔹 handleLogin mocken
jest.mock("../src/infrastructure/api/handleLogin", () => ({
  handleLogin: jest.fn(),
}));

// 🔹 useNavigate mocken
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>,
  );
}

describe("Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rendert das Login-Formular", () => {
    renderLogin();

    expect(
      screen.getByText("Willkommen zur DEDALUS Webapp"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("E-Mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("führt einen erfolgreichen Login durch und navigiert zu /home", async () => {
    (handleLogin as jest.Mock).mockResolvedValue({ error: null });

    renderLogin();

    fireEvent.change(screen.getByLabelText("E-Mail"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(handleLogin).toHaveBeenCalledWith("test@example.com", "secret123");
    });

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  it("zeigt eine Fehlermeldung bei Login-Fehler an", async () => {
    (handleLogin as jest.Mock).mockResolvedValue({
      error: "Ungültige Zugangsdaten",
    });

    renderLogin();

    fireEvent.change(screen.getByLabelText("E-Mail"), {
      target: { value: "wrong@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(
      await screen.findByText("Ungültige Zugangsdaten"),
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
