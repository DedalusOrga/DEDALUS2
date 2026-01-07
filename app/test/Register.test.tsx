import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "../src/pages/Register";

// ✅ useNavigate mock
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ✅ supabase mock (wichtig wegen import.meta.env / Vite)
const signUpMock = jest.fn();

jest.mock("../src/infrastructure/supabase/client", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => signUpMock(...args),
    },
  },
}));

function renderRegister() {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
}

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rendert das Registrierungsformular", () => {
    renderRegister();

    expect(
      screen.getByText("Willkommen zur DEDALUS Webapp")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Erstellen Sie ein Konto, um fortzufahren.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText("E-Mail")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort")).toBeInTheDocument();
    expect(screen.getByLabelText("Passwort bestätigen")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /registrieren/i })
    ).toBeInTheDocument();
  });

  it("zeigt eine Validierungsfehlermeldung bei zu kurzem Passwort und ruft Supabase nicht auf", async () => {
    renderRegister();

    fireEvent.change(screen.getByLabelText("E-Mail"), {
      target: { value: "test@example.com" },
    });

    // zu kurz (<12)
    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "Short1!" },
    });

    fireEvent.change(screen.getByLabelText("Passwort bestätigen"), {
      target: { value: "Short1!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrieren/i }));

    expect(
      await screen.findByText(
        "Das Passwort muss mindestens 12 Zeichen lang sein."
      )
    ).toBeInTheDocument();

    expect(signUpMock).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("zeigt eine Fehlermeldung wenn Supabase signUp einen Fehler zurückgibt", async () => {
    signUpMock.mockResolvedValueOnce({ error: { message: "Nope" } });

    renderRegister();

    fireEvent.change(screen.getByLabelText("E-Mail"), {
      target: { value: "test@example.com" },
    });

    // valid: >=12, Groß/Klein/Zahl/Sonderzeichen
    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "ValidPassw0rd!" },
    });

    fireEvent.change(screen.getByLabelText("Passwort bestätigen"), {
      target: { value: "ValidPassw0rd!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrieren/i }));

    expect(
      await screen.findByText(
        "Registrierung nicht möglich. Bitte prüfen Sie Ihre Zugangsberechtigung oder wenden Sie sich an den Studienleiter."
      )
    ).toBeInTheDocument();

    expect(signUpMock).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "ValidPassw0rd!",
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("bei erfolgreichem Signup zeigt Erfolgsmeldung und navigiert nach 1200ms zu /login", async () => {
    jest.useFakeTimers();
    signUpMock.mockResolvedValueOnce({ error: null });

    renderRegister();

    fireEvent.change(screen.getByLabelText("E-Mail"), {
      target: { value: "test@example.com" },
    });

    fireEvent.change(screen.getByLabelText("Passwort"), {
      target: { value: "ValidPassw0rd!" },
    });

    fireEvent.change(screen.getByLabelText("Passwort bestätigen"), {
      target: { value: "ValidPassw0rd!" },
    });

    fireEvent.click(screen.getByRole("button", { name: /registrieren/i }));

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "ValidPassw0rd!",
      });
    });

    expect(
      await screen.findByText("Konto erstellt! Bitte jetzt einloggen …")
    ).toBeInTheDocument();

    // Timeout ausführen
    jest.advanceTimersByTime(1200);

    expect(mockNavigate).toHaveBeenCalledWith("/login");

    jest.useRealTimers();
  });
});
