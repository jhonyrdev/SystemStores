import React, { useCallback, useState } from "react";

type FAQ = {
  question: string;
  answer: string;
};

const faqs: FAQ[] = [
  {
    question: "¿Cuánto tardará en llegar mi pedido?",
    answer:
      "El tiempo de entrega depende de tu ubicación. Normalmente, los pedidos llegan entre 3-7 días hábiles.",
  },
  {
    question: "¿Puedo devolver un producto?",
    answer:
      "Sí, aceptamos devoluciones dentro de los 30 días posteriores a la compra, siempre que el producto esté en condiciones originales.",
  },
  {
    question: "¿Cómo puedo pagar?",
    answer:
      "Aceptamos tarjetas de crédito, débito y pagos mediante PayPal. Todas las transacciones son seguras.",
  },
  {
    question: "¿Tienen envío internacional?",
    answer:
      "Sí, realizamos envíos internacionales. El costo y tiempo de entrega varían según el país de destino.",
  },
];

const Fq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">
        Preguntas Frecuentes
      </h1>
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          const panelId = `faq-panel-${index}`;
          const btnId = `faq-btn-${index}`;

          return (
            <div
              key={`${faq.question}-${index}`}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <button
                id={btnId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full text-left flex justify-between items-center"
                onClick={() => toggleFaq(index)}
              >
                <span className="font-medium">{faq.question}</span>
                <span className="text-xl" aria-hidden>
                  {isOpen ? "−" : "+"}
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                hidden={!isOpen}
              >
                <p className="mt-2 text-gray-700">{faq.answer}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Fq;
