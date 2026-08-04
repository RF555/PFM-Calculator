import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { IconGallery } from "./IconGallery.tsx";
import "./index.css";

const gallery = location.search.includes("gallery");

createRoot(document.getElementById("root")!).render(gallery ? <IconGallery /> : <App />);
