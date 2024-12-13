import { render, screen } from "@testing-library/react";
import InitChat from "../views/InitChat"; // Asegúrate de que la ruta sea correcta
import { MemoryRouter } from "react-router-dom";

test("renders InitChat component", () => {
  render(
    <MemoryRouter>
      <InitChat />
    </MemoryRouter>
  );
  const headerElement = screen.getByText(/chat/i); // Cambia según el texto en InitChat
  expect(headerElement).toBeInTheDocument();
});
