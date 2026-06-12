import { createFileRoute } from "@tanstack/react-router";
import { PaintStudio } from "@/components/editor/PaintStudio";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SimPaint — Simule cores de tinta na sua parede" },
      {
        name: "description",
        content:
          "Suba uma foto da parede, pinte digitalmente com cores reais dos catálogos Hidracor e Inquine e calcule quantos litros você precisa.",
      },
      { property: "og:title", content: "SimPaint — Simulador de cores de tinta" },
      {
        property: "og:description",
        content:
          "Visualize sua parede com cores reais de Hidracor e Inquine antes de comprar a tinta.",
      },
    ],
  }),
  component: () => <PaintStudio />,
});
