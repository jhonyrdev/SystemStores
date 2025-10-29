import { useEffect } from "react";

export default function ViewScroll() {
  useEffect(() => {
    let timeout: number;

    const handleScroll = () => {
      document.body.classList.add("scrolling");
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        document.body.classList.remove("scrolling");
      }, 1000); // quita la clase 1s después de dejar de scrollear
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
