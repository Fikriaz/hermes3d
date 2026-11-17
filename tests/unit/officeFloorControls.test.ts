import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createElement } from "react";

import { OfficeFloorControls } from "@/features/office/components/OfficeFloorControls";

afterEach(cleanup);

describe("OfficeFloorControls team panel", () => {
  it("shows the founder first with a working-style note", () => {
    render(createElement(OfficeFloorControls, { activeFloorId: "hermes", onFloorChange: () => {} }));

    fireEvent.click(screen.getByRole("button", { name: "Tim & alur video" }));

    expect(screen.getByRole("heading", { name: "Founder · HQ" })).toBeInTheDocument();
    expect(screen.getByText("Fikri")).toBeInTheDocument();
    expect(screen.getByText(/Curious ENTJ/)).toBeInTheDocument();
  });

  it("keeps the founder out of the IT team list", () => {
    render(createElement(OfficeFloorControls, { activeFloorId: "hermes", onFloorChange: () => {} }));
    fireEvent.click(screen.getByRole("button", { name: "Tim & alur video" }));

    const itSection = screen.getByRole("heading", { name: "Tim IT · HQ" });
    expect(itSection).toBeInTheDocument();
    // Fikriaz appears exactly once (founder section only).
    expect(screen.getAllByText("Fikri")).toHaveLength(1);
  });

  it("still lists the social media team", () => {
    render(createElement(OfficeFloorControls, { activeFloorId: "hermes", onFloorChange: () => {} }));
    fireEvent.click(screen.getByRole("button", { name: "Tim & alur video" }));

    expect(screen.getByRole("heading", { name: "Tim Sosmed · YouTube & TikTok" })).toBeInTheDocument();
    expect(screen.getByText("Nadia")).toBeInTheDocument();
  });
});
