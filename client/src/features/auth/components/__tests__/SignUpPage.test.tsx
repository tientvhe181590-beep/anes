import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router";
import { SignUpPage } from "../SignUpPage";

const submitMock = vi.fn();
const googleMock = vi.fn();

let registerState = {
  submit: submitMock,
  fieldErrors: {} as Record<string, string | undefined>,
  serverError: null as string | null,
  isLoading: false,
};

let googleState = {
  initiateGoogleSignIn: googleMock,
  error: null as string | null,
  isLoading: false,
};

const strengthState = {
  hasLength: true,
  hasUppercase: false,
  hasNumber: false,
};

vi.mock("../../hooks/useRegister", () => ({
  useRegister: () => registerState,
  checkPasswordStrength: () => strengthState,
}));

vi.mock("../../hooks/useGoogleAuth", () => ({
  useGoogleAuth: () => googleState,
}));

describe("SignUpPage", () => {
  beforeEach(() => {
    submitMock.mockReset();
    googleMock.mockReset();
    registerState = { submit: submitMock, fieldErrors: {}, serverError: null, isLoading: false };
    googleState = { initiateGoogleSignIn: googleMock, error: null, isLoading: false };
  });

  it("renders the sign-up form", () => {
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
  });

  it("shows strength indicators when password is entered", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Password"), "Password123");

    expect(screen.getByText("8+ characters")).toBeInTheDocument();
    expect(screen.getByText("1 uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("1 number")).toBeInTheDocument();
  });

  it("submits registration details", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Full Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.type(screen.getByLabelText("Password"), "Password123");
    await user.type(screen.getByLabelText("Confirm Password"), "Password123");
    await user.click(screen.getByRole("button", { name: "Create Account" }));

    expect(submitMock).toHaveBeenCalledWith({
      email: "jane@example.com",
      password: "Password123",
      confirmPassword: "Password123",
      fullName: "Jane Doe",
    });
  });

  it("shows server error", () => {
    registerState = {
      submit: submitMock,
      fieldErrors: {},
      serverError: "Registration failed",
      isLoading: false,
    };

    render(
      <MemoryRouter>
        <SignUpPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Registration failed");
  });
});
