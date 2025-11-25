import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import React, { useState } from "react";

const Contacto = () => {
  type ContactForm = {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  };

  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    console.log("Form submitted:", formData);
    alert("¡Mensaje enviado! Nos pondremos en contacto contigo pronto.");
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      info: "info@tambito.com",
      subinfo: "ventas@tambito.com",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Teléfono",
      info: "+51 985 256 548",
      subinfo: "Lun - Vie: 9:00 - 18:00",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Horario",
      info: "Lunes a Viernes",
      subinfo: "9:00 AM - 6:00 PM",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-[#fcdb76ff] text-principal py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Contáctanos</h1>
          <p className="text-xl text-black-300">
            Estamos aquí para ayudarte. Envíanos un mensaje
          </p>
        </div>
      </div>

      <div className="container-bootstrap max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Información de Contacto
        </h2>
        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((item, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#fad4f6ff] text-principal rounded-lg flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm">{item.info}</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {item.subinfo}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Envíanos un Mensaje
                </h2>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+51 999 999 999"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Asunto *</Label>
                      <Input
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="¿En qué podemos ayudarte?"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje *</Label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Escribe tu mensaje aquí..."
                      rows={6}
                      className="w-full resize-none file:text-foreground placeholder:text-muted-foreground border-input rounded-md border bg-transparent px-3 py-2 text-base shadow-xs focus-visible:border-ring focus-visible:ring-ring/50"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    className="w-full bg-[#a32497ff] hover:bg-[#5e0956] text-white font-semibold py-6 text-lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Mensaje
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Media + Map: side-by-side on lg, stacked and centered on small screens */}
        <div className="grid lg:grid-cols-3 gap-8 items-start mb-4">
          {/* Social column */}
          <div className="lg:col-span-1 flex justify-center lg:justify-start">
            <Card className="text-black border-0 shadow-none bg-transparent py-2">
              <CardContent className="p-2 flex flex-col items-center lg:items-start text-center lg:text-left">
                <h3 className="font-semibold mb-3">Síguenos</h3>
                <div className="flex space-x-3 justify-center lg:justify-start">
                  <a
                    href="https://www.facebook.com/"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                  >
                    <i className="fa-brands fa-facebook-f text-lg"></i>
                  </a>
                  <a
                    href="https://www.tiktok.com/explore"
                    aria-label="Tiktok"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/10 text-black hover:bg-[#000] hover:text-white"
                  >
                    <i className="fa-brands fa-tiktok text-lg"></i>
                  </a>
                  <a
                    href="https://www.instagram.com/"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-white/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white"
                  >
                    <i className="fa-brands fa-instagram text-lg"></i>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-xl py-0 ">
              <CardContent className="px-0">
                <div className="bg-gradient-principal h-80 flex items-center justify-center text-white">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Visítanos</h3>
                    <p className="text-lg">Av. Peru 121, San Martin, Lima</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
