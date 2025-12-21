import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminPage from "../src/pages/AdminPage";

/* ================================
   react-router mock
================================ */
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

/* ================================
   Auth mock
================================ */
const mockSignOut = jest.fn();

jest.mock("../src/hooks/AuthProvider", () => ({
  useAuth: () => ({
    user: { email: "admin@test.de" },
    signOut: mockSignOut,
  }),
}));

/* ================================
   Supabase mock (OHNE spread!)
================================ */

// query chain
const mockOrder = jest.fn();
const mockSelect = jest.fn(() => ({ order: mockOrder }));
const mockInsert = jest.fn();

const mockFrom = jest.fn((table: string) => ({
  select: mockSelect,
  insert: mockInsert,
}));

// storage chain
const mockStorageUpload = jest.fn();
const mockGetPublicUrl = jest.fn();

const mockStorageFrom = jest.fn((bucket: string) => ({
  upload: mockStorageUpload,
  getPublicUrl: mockGetPublicUrl,
}));

jest.mock("../src/infrastructure/supabase/client", () => ({
  supabase: {
    from: (table: string) => mockFrom(table),
    storage: {
      from: (bucket: string) => mockStorageFrom(bucket),
    },
  },
}));

/* ================================
   Helpers
================================ */
function renderAdmin() {
  return render(
    <BrowserRouter>
      <AdminPage />
    </BrowserRouter>
  );
}

async function waitForInitialLoad() {
  await waitFor(() => {
    expect(mockOrder).toHaveBeenCalled();
  });
}

/* ================================
   Tests
================================ */
describe("AdminPage", () => {
  beforeAll(() => {
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    (console.warn as jest.Mock).mockRestore?.();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("lädt Module beim Start und zeigt sie an", async () => {
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

    expect(await screen.findByText("Modul 1")).toBeInTheDocument();
    expect(screen.getByText("modul-1")).toBeInTheDocument();

    expect(mockFrom).toHaveBeenCalledWith("content_modules");
  });

  it("legt ein Textmodul an", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });
    mockInsert.mockResolvedValueOnce({ error: null });

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

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "text" },
    });

    fireEvent.change(
      screen.getByPlaceholderText("z. B. Behandlungsinformation"),
      { target: { value: "Mein Text" } }
    );

    fireEvent.change(screen.getByPlaceholderText("z. B. behandlungsinfo"), {
      target: { value: "mein text" },
    });

    fireEvent.change(
      screen.getByPlaceholderText(
        "Text, der im Frontend angezeigt werden soll…"
      ),
      { target: { value: "Inhalt" } }
    );

    fireEvent.click(screen.getByRole("button", { name: "Modul anlegen" }));

    await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));

    const payload = mockInsert.mock.calls[0][0][0];

    expect(payload).toEqual(
      expect.objectContaining({
        title: "Mein Text",
        slug: "mein-text",
        type: "text",
        status: "published",
        body_md: "Inhalt",
        file_url: null,
      })
    );
  });

  it("lädt eine PDF hoch und setzt file_url", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    mockStorageUpload.mockResolvedValueOnce({ error: null });
    mockGetPublicUrl.mockReturnValueOnce({
      data: {
        publicUrl: "https://example.supabase.co/storage/PDF/test.pdf",
      },
    });

    renderAdmin();
    await waitForInitialLoad();

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "pdf" },
    });

    fireEvent.change(screen.getByPlaceholderText("z. B. behandlungsinfo"), {
      target: { value: "mein-pdf" },
    });

    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

    const file = new File(["dummy"], "test.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(fileInput, {
      target: { files: [file] },
    });

    await waitFor(() => {
      expect(mockStorageFrom).toHaveBeenCalledWith("PDF");
      expect(mockStorageUpload).toHaveBeenCalled();
      expect(mockGetPublicUrl).toHaveBeenCalled();
    });

    const urlInput = screen.getByPlaceholderText(
      "Direkte PDF-URL (oder wird nach Upload automatisch gesetzt)"
    ) as HTMLInputElement;

    expect(urlInput.value).toContain("test.pdf");
  });

  it("Logout meldet ab und navigiert zu /login", async () => {
    mockOrder.mockResolvedValueOnce({ data: [], error: null });

    renderAdmin();
    await waitForInitialLoad();

    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith("/login", { replace: true });
  });
});
