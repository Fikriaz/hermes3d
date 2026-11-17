import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";
import { QaLabScreen } from "@/features/qa-lab/QaLabScreen";

afterEach(cleanup);

describe("QaLabScreen", () => {
  it("opens a report form without preselecting a seeded bug", () => {
    render(createElement(QaLabScreen));

    fireEvent.click(screen.getByRole("button", { name: "Temukan bug? Laporkan" }));

    expect(screen.getByRole("dialog", { name: "Laporkan temuan" })).toBeInTheDocument();
    expect(screen.getByText("Form validasi bug")).toBeInTheDocument();
  });

  it("explains incomplete reports instead of revealing a bug case", () => {
    render(createElement(QaLabScreen));
    fireEvent.click(screen.getByRole("button", { name: "Temukan bug? Laporkan" }));
    fireEvent.click(screen.getByRole("button", { name: "Kirim & validasi" }));

    expect(screen.getByRole("status")).toHaveTextContent("Lengkapi dulu");
    expect(screen.queryByText(/Case: BUG-/)).not.toBeInTheDocument();
  });
});
