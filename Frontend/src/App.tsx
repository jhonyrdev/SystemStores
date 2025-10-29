import { BrowserRouter } from "react-router-dom";
import AppRoutes from "@routes/index";
import { Toaster } from "sonner";
import ViewScroll from "./hooks/scroll/viewScroll";
import TopScroll from "./hooks/scroll/topScroll";
import { CarritoProvider } from "./context/carritoContext";

function App() {
  return (
    <>
      <Toaster richColors position="top-right" />
      <CarritoProvider>
        <BrowserRouter>
          <TopScroll />
          <ViewScroll />
          <AppRoutes />
        </BrowserRouter>
      </CarritoProvider>
    </>
  );
}

export default App;
