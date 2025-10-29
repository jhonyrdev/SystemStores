const Footer = () => {
  return (
    <footer className="bg-secundario text-black pt-10">
      <div className="container-bootstrap mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <img
                src="/img/logo/logoPrincipal.webp"
                alt="Tambito+"
                className="h-12 sm:block sm:h-15 w-auto"
              />
        </div>

        <div>
          <h6 className="uppercase font-semibold mb-3">Enlaces</h6>
          <ul className="space-y-2">
            <li>
              <a href="/productos" className="hover:text-primary">
                Productos
              </a>
            </li>
            <li>
              <a href="/ofertas" className="hover:text-primary">
                Ofertas
              </a>
            </li>
            <li>
              <a href="/nosotros" className="hover:text-primary">
                Nosotros
              </a>
            </li>
            <li>
              <a href="/contacto" className="hover:text-primary">
                Contacto
              </a>
            </li>
          </ul>
        </div>

        <div className="col-md-4 mb-3">
          <h6 className="text-uppercase fw-bold">Síguenos</h6>
          <div className="d-flex mt-4">
            <a href="#" className="me-3 text-black">
              <i className="fa-brands fa-facebook text-2xl"></i>
            </a>
            <a href="#" className="me-3 text-black">
              <i className="fa-brands fa-instagram text-2xl"></i>
            </a>
            <a href="#" className="me-3 text-black">
              <i className="fa-brands fa-tiktok text-2xl"></i>
            </a>
            <a href="#" className="text-black">
              <i className="fa-brands fa-whatsapp text-2xl"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="bg-principal-oscuro mt-8 py-4">
        <div className="container-bootstrap text-white text-center">
          <p className="text-sm">
          &copy; 2025 <span className="font-semibold">TAMBITO</span>. Todos los
          derechos reservados.
        </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
