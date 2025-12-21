import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminPage from "../src/pages/AdminPage"; // ggf. anpassen

// ---------------- react-router mock ----------------
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// ---------------- Auth mock ----------------
const mockSignOut = jest.fn();

jest.mock("../src/hooks/AuthProvider", () => ({
  useAuth: () => ({
    user: { email: "admin@test.de" },
    signOut: mockSignOut,
  }),
}));

// ---------------- Supabase mock ----------------
// content_modules query chain
const mockOrder = jest.fn();
const mockSelect = jest.fn(() => ({ order: mockOrder }));
const mockInsert = jest.fn();

// storage chain
const mockStorageUpload = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockStorageFrom = jest.fn(() => ({
  upload: mockStorageUpload,
  getPublicUrl: mockGetPublicUrl,
}));

const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
}));

jest.mock("../src/infrastructure/supabase/client", () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
    storage: {
      from: (...args: any[]) => mockStorageFrom(...args),
    },
  },
}));

function renderAdmin() {
  return render(
    <BrowserRouter>
      <AdminPage />
    </BrowserRouter>
  );
}

/**
 * Hilfsfunktion:
 * wartet, bis der initiale loadModules-Call durch ist (order() wurde aufgerufen)
 * → reduziert "act(...)" Warnungen deutlich.
 */
async function waitForInitialLoad() {
  await waitFor(() => {
    expect(mockOrder).toHaveBeenCalled();
  });
}

describe("AdminPage", () => {
  beforeAll(() => {
    // Optional: React Router Future warnings ausblenden
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.warn as jest.Mock).mockRestore?.();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lädt Module beim Start und zeigt sie in der Tabelle", async () => {
    mockOrder.mockResolvedValueOnce({
      data: [
        {
          id: "1",
          slug: "modul-1",
          title: "Modul 1",
          type: "text",
          body_md: "Hallo",
          file_url: null,
          status: "published",
        },
      ],
      error: null,
    });

    renderAdmin();

    // wait for async effect to finish
    await screen.findByText("Modul 1");

    expect(screen.getByText("modul-1")).toBeInTheDocument();
    expect(screen.getByText("published")).toBeInTheDocument();

    expect(mockFrom).toHaveBeenCalledWith("content_modules");
    expect(mockSelect).toHaveBeenCalledWith(
      "id, slug, title, type, body_md, file_url, status"
    );
    expect(mockOrder).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("legt ein Textmodul an (insert payload korrekt)", async () => {
    // 1) initial loadModules
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    // 2) insert ok
    mockInsert.mockResolvedValueOnce({ error: null });

    // 3) reload after insert
    mockOrder.mockResolvedValueOnce({
      data: [
        {
          id: "2",
          slug: "mein-text",
          title: "Mein Text",
          type: "text",
          body_md: "Inhalt",
          file_url: null,
          status: "published",
        },
      ],
      error: null,
    });

    renderAdmin();
    await waitForInitialLoad();

    // Typ (select) -> per role "combobox"
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "text" },
    });

    // Titel -> per placeholder
    fireEvent.change(
      screen.getByPlaceholderText("z. B. Behandlungsinformation"),
      { target: { value: "Mein Text" } }
    );

    // Kurzname/slug -> per placeholder
    fireEvent.change(screen.getByPlaceholderText("z. B. behandlungsinfo"), {
      target: { value: "mein text" },
    });

    // Textinhalt -> per placeholder
    fireEvent.change(
      screen.getByPlaceholderText(
        "Text, der im Frontend angezeigt werden soll…"
      ),
      { target: { value: "Inhalt" } }
    );

    // submit
    fireEvent.click(screen.getByRole("button", { name: "Modul anlegen" }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));

    const payload = mockInsert.mock.calls[0][0][0];

    expect(payload).toMatchObject({
      title: "Mein Text",
      slug: "mein-text", // normalisiert
      type: "text",
      status: "published",
      body_md: "Inhalt",
      file_url: null,
    });

    // reload zeigt Modul
    expect(await screen.findByText("Mein Text")).toBeInTheDocument();
    expect(screen.getByText("mein-text")).toBeInTheDocument();
  });

  it("lädt eine PDF-Datei hoch und setzt file_url aus getPublicUrl()", async () => {
    // initial load
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    mockStorageUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: {
        publicUrl:
          "https://example.supabase.co/storage/v1/object/public/PDF/test.pdf",
      },
    });

    renderAdmin();
    await waitForInitialLoad();

    // Typ auf pdf setzen
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "pdf" },
    });

    // slug setzen (wird für filePath verwendet)
    fireEvent.change(screen.getByPlaceholderText("z. B. behandlungsinfo"), {
      target: { value: "mein-pdf" },
    });

    // file input robust greifen (weil kein label-for)
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    expect(fileInput).toBeTruthy();

    const file = new File(["dummy"], "test.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockStorageFrom).toHaveBeenCalledWith("PDF");
      expect(mockStorageUpload).toHaveBeenCalledTimes(1);
      expect(mockGetPublicUrl).toHaveBeenCalledTimes(1);
    });

    // URL Input enthält publicUrl
    const urlInput = screen.getByPlaceholderText(
      "Direkte PDF-URL (oder wird nach Upload automatisch gesetzt)"
    ) as HTMLInputElement;

    expect(urlInput.value).toBe(
      "https://example.supabase.co/storage/v1/object/public/PDF/test.pdf"
    );
  });

  it("Logout ruft signOut auf und navigiert zu /login", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    renderAdmin();
    await waitForInitialLoad();

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
