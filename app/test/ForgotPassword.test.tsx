import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ForgotPassword from "../src/pages/ForgotPassword";

// --- Supabase mock ---
const resetPasswordForEmailMock = jest.fn();

jest.mock("../src/infrastructure/supabase/client", () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: (...args: unknown[]) =>
        resetPasswordForEmailMock(...args),
    },
  },
}));

function renderWithRouter(initialEntry = "/auth/forgot") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth/forgot" element={<ForgotPassword />} />
        <Route path="/login" element={<div>LOGIN_PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ForgotPassword", () => {
  beforeEach(() => {
    resetPasswordForEmailMock.mockReset();
  });

  it("prefillt die E-Mail aus dem Query-Parameter", async () => {
    renderWithRouter("/auth/forgot?email=test@example.com");

    const emailInput = screen.getByPlaceholderText(
      "Ihre E-Mail-Adresse",
    ) as HTMLInputElement;

    await waitFor(() => {
      expect(emailInput.value).toBe("test@example.com");
    });
  });

  it("sendet Reset-Link und zeigt Erfolgsmeldung", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ error: null });

    renderWithRouter("/auth/forgot");

    const emailInput = screen.getByPlaceholderText("Ihre E-Mail-Adresse");
    fireEvent.change(emailInput, { target: { value: "user@example.com" } });

    fireEvent.click(screen.getByRole("button", { name: /reset-link senden/i }));

    // prüft, dass Supabase aufgerufen wurde inkl. redirectTo
    await waitFor(() => {
      expect(resetPasswordForEmailMock).toHaveBeenCalledTimes(1);
    });

    const [emailArg, optionsArg] = resetPasswordForEmailMock.mock.calls[0];
    expect(emailArg).toBe("user@example.com");
    expect(optionsArg).toEqual({
      redirectTo: `${window.location.origin}/#/auth/reset`,
    });

    // Erfolgsmeldung sichtbar
    expect(
      await screen.findByText(
        "Wenn die E-Mail existiert, wurde ein Link zum Zurücksetzen gesendet.",
      ),
    ).toBeInTheDocument();
  });

  it("zeigt Fehlermeldung, wenn Supabase einen Fehler liefert", async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      error: { message: "Rate limit exceeded" },
    });

    renderWithRouter("/auth/forgot");

    fireEvent.change(screen.getByPlaceholderText("Ihre E-Mail-Adresse"), {
      target: { value: "user@example.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /reset-link senden/i }));

    expect(await screen.findByText("Rate limit exceeded")).toBeInTheDocument();
  });

  it("navigiert über den Login-Button zu /login", async () => {
    renderWithRouter("/auth/forgot");

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("LOGIN_PAGE")).toBeInTheDocument();
  });
});
