const categories = [
  {
    name: "Cervezas",
    img: "/img/catProductos/cerveza.webp",
  },
  {
    name: "RTDs",
    img: "/img/catProductos/rtds.webp",
  },
  {
    name: "Licores",
    img: "/img/catProductos/licor.webp",
  },
  {
    name: "Comidas",
    img: "/img/catProductos/comida.webp",
  },
  {
    name: "Bebidas",
    img: "/img/catProductos/bebidas.webp",
  },
  {
    name: "Antojos",
    img: "/img/catProductos/antojos.webp",
  },
  {
    name: "Helados",
    img: "/img/catProductos/helados.webp",
  },
  {
    name: "Despensa",
    img: "/img/catProductos/despensa.webp",
  },
];

import { Link } from "react-router-dom";

const CategorySection = () => {
  return (
    <section className="my-10">
      <h5 className="text-center text-lg font-semibold text-[#a51884] mb-4">
        NUESTRAS CATEGORÍAS
      </h5>

      {/* Scroll horizontal, con padding horizontal */}
      <div className="container-bootstrap px-5">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4 sm:gap-6 xs:gap-8 w-max mx-auto">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/categoria/${category.name.toLowerCase()}`}
                className="flex flex-col items-center flex-shrink-0 scroll-snap-align-start text-center w-[72px] sm:w-[80px]"
              >
                <img
                  src={category.img}
                  alt={category.name}
                  loading="lazy"
                  className="w-full aspect-square rounded-full object-contain bg-white p-2"
                />
                <span className="mt-2 text-sm text-muted-foreground">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
