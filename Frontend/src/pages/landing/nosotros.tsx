import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, Heart, Users, Award } from "lucide-react";

const Nosotros = () => {
  const values = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: "Calidad Premium",
      description:
        "Seleccionamos cuidadosamente cada producto para garantizar la mejor calidad para nuestros clientes.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Pasión por el Servicio",
      description:
        "Nos apasiona ofrecer una experiencia de compra excepcional en cada interacción.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Comunidad",
      description:
        "Construimos relaciones duraderas con nuestros clientes y nos preocupamos por sus necesidades.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excelencia",
      description:
        "Nos esforzamos por superar las expectativas y ofrecer el mejor servicio posible.",
    },
  ];

  return (
    <div className=" min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-[#fcdb76ff] text-principal py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Nuestra Historia</h1>
          <p className="text-xl text-black-300">
            Creando experiencias de compra inolvidables desde 2020
          </p>
        </div>
      </div>

      {/* Story Section */}
      <div className="container-bootstrap mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Quiénes Somos
            </h2>
            <p className="text-slate-600 mb-4 leading-relaxed">
              Somos una tienda dedicada a ofrecer productos de la más alta
              calidad a nuestros clientes. Comenzamos como un pequeño
              emprendimiento con la visión de transformar la forma en que las
              personas compran.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Con años de experiencia en el sector, hemos crecido hasta
              convertirnos en un referente de confianza, manteniendo siempre
              nuestros valores fundamentales de calidad, servicio y
              transparencia.
            </p>
          </div>
          <img
            src="/img/ilustraciones/personaConfudida.png"
            alt="Imagen Quiénes Somos"
            className="h-auto w-auto object-cover"
          />{" "}
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Nuestra Misión
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Proporcionar productos excepcionales que mejoren la vida de
                nuestros clientes, mientras construimos relaciones basadas en la
                confianza y el servicio personalizado.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Nuestra Visión
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Ser la primera opción para clientes que buscan calidad,
                innovación y un servicio excepcional, expandiendo nuestra
                presencia y manteniendo nuestros estándares.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-5">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-10">
            Nuestros Valores
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secundario-claro text-secundario-oscuro rounded-full mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;
