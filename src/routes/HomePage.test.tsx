import { afterEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage";
import { TreeProvider } from "../context/TreeContext";

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <TreeProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tree" element={<div>TREE PAGE</div>} />
        </Routes>
      </TreeProvider>
    </MemoryRouter>,
  );
}

afterEach(() => {
  localStorage.clear();
});

describe("HomePage", () => {
  it("renders heading and inputs", () => {
    renderHome();
    expect(
      screen.getByRole("heading", { name: /load a directory tree/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /visualise/i })).toBeDisabled();
  });

  it("shows error for invalid JSON", async () => {
    const user = userEvent.setup();
    renderHome();
    const textarea = screen.getByLabelText(/^json$/i);
    await user.click(textarea);
    await user.paste("{not valid}");
    await user.click(screen.getByRole("button", { name: /visualise/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/invalid json/i);
  });

  it("navigates to /tree on valid JSON", async () => {
    const user = userEvent.setup();
    renderHome();
    const textarea = screen.getByLabelText(/^json$/i);
    const json = JSON.stringify({
      name: "root",
      type: "folder",
      children: [{ name: "a.txt", type: "file", size: 1 }],
    });
    await user.click(textarea);
    await user.paste(json);
    await user.click(screen.getByRole("button", { name: /visualise/i }));
    expect(await screen.findByText("TREE PAGE")).toBeInTheDocument();
  });
});
