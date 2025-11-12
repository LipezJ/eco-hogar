import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          ¿Necesito tarjeta de crédito para empezar?
        </AccordionTrigger>
        <AccordionContent>
          No. Puedes registrarte y empezar a usar EcoHogar sin tarjeta de crédito.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          ¿Puedo importar mis datos actuales?
        </AccordionTrigger>
        <AccordionContent>
          Sí. Estamos trabajando en importación desde CSV/Excel. Mientras tanto, puedes cargar tus movimientos manualmente.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          ¿Cómo protegen mi información?
        </AccordionTrigger>
        <AccordionContent>
          Tu sesión se gestiona con cookies seguras y protegemos las acciones sensibles con verificación anti‑bots.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>
          ¿Puedo usar EcoHogar en móvil y tablet?
        </AccordionTrigger>
        <AccordionContent>
          Sí. Toda la interfaz está diseñada con layout responsive para móviles, tablets y escritorio.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}