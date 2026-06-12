export type PaintColor = {
  brand: "Hidracor" | "Inquine";
  code: string;
  name: string;
  hex: string;
  line: string;
};

// Catálogo aproximado a partir dos PDFs enviados.
// Hex codes podem ser ajustados depois com o conta-gotas direto do PDF.
export const CATALOG: PaintColor[] = [
  // ============ HIDRACOR — Linha Geral ============
  { brand: "Hidracor", code: "H001", name: "Branco Neve", hex: "#F7F6F1", line: "Geral" },
  { brand: "Hidracor", code: "H002", name: "Branco Gelo", hex: "#EEEFEA", line: "Geral" },
  { brand: "Hidracor", code: "H003", name: "Palha", hex: "#E8DCB6", line: "Geral" },
  { brand: "Hidracor", code: "H004", name: "Marfim", hex: "#EDE2C7", line: "Geral" },
  { brand: "Hidracor", code: "H005", name: "Areia", hex: "#D9C9A3", line: "Geral" },
  { brand: "Hidracor", code: "H006", name: "Camurça", hex: "#C8AE85", line: "Geral" },
  { brand: "Hidracor", code: "H007", name: "Gengibre", hex: "#B98855", line: "Geral" },
  { brand: "Hidracor", code: "H008", name: "Caramelo", hex: "#9C6A3C", line: "Geral" },
  { brand: "Hidracor", code: "H009", name: "Tabaco", hex: "#7A4E2D", line: "Geral" },
  { brand: "Hidracor", code: "H010", name: "Chocolate", hex: "#4E2E1A", line: "Geral" },
  { brand: "Hidracor", code: "H011", name: "Pêssego", hex: "#F4C9A8", line: "Geral" },
  { brand: "Hidracor", code: "H012", name: "Coral", hex: "#E08770", line: "Geral" },
  { brand: "Hidracor", code: "H013", name: "Terracota", hex: "#B7553E", line: "Geral" },
  { brand: "Hidracor", code: "H014", name: "Vermelho Goiaba", hex: "#B83A3F", line: "Geral" },
  { brand: "Hidracor", code: "H015", name: "Rosa Bebê", hex: "#F2D4D6", line: "Geral" },
  { brand: "Hidracor", code: "H016", name: "Rosa Antigo", hex: "#C8868D", line: "Geral" },
  { brand: "Hidracor", code: "H017", name: "Lilás", hex: "#C0A8C6", line: "Geral" },
  { brand: "Hidracor", code: "H018", name: "Violeta", hex: "#6E4A8E", line: "Geral" },
  { brand: "Hidracor", code: "H019", name: "Azul Bebê", hex: "#CFE0EC", line: "Geral" },
  { brand: "Hidracor", code: "H020", name: "Azul Céu", hex: "#7FB6D9", line: "Geral" },
  { brand: "Hidracor", code: "H021", name: "Azul Médio", hex: "#3F7BB2", line: "Geral" },
  { brand: "Hidracor", code: "H022", name: "Azul Petróleo", hex: "#1E4F66", line: "Geral" },
  { brand: "Hidracor", code: "H023", name: "Azul Marinho", hex: "#1F2C4E", line: "Geral" },
  { brand: "Hidracor", code: "H024", name: "Verde Água", hex: "#B6DACD", line: "Geral" },
  { brand: "Hidracor", code: "H025", name: "Verde Menta", hex: "#8FC9A8", line: "Geral" },
  { brand: "Hidracor", code: "H026", name: "Verde Folha", hex: "#3E8C4E", line: "Geral" },
  { brand: "Hidracor", code: "H027", name: "Verde Oliva", hex: "#6E7A3A", line: "Geral" },
  { brand: "Hidracor", code: "H028", name: "Verde Bandeira", hex: "#1F6438", line: "Geral" },
  { brand: "Hidracor", code: "H029", name: "Amarelo Claro", hex: "#F4E48A", line: "Geral" },
  { brand: "Hidracor", code: "H030", name: "Amarelo Ouro", hex: "#E8B948", line: "Geral" },
  { brand: "Hidracor", code: "H031", name: "Cinza Pérola", hex: "#D5D3CE", line: "Geral" },
  { brand: "Hidracor", code: "H032", name: "Cinza Médio", hex: "#8E8E8B", line: "Geral" },
  { brand: "Hidracor", code: "H033", name: "Cinza Escuro", hex: "#4D4D4B", line: "Geral" },
  { brand: "Hidracor", code: "H034", name: "Preto", hex: "#1A1A1A", line: "Geral" },
  { brand: "Hidracor", code: "H035", name: "Concreto", hex: "#B2AEA4", line: "Geral" },
  { brand: "Hidracor", code: "H036", name: "Fendi", hex: "#A89E8E", line: "Geral" },

  // ============ INQUINE — Linha Geral ============
  { brand: "Inquine", code: "002", name: "Branco Neve", hex: "#F8F7F2", line: "Geral" },
  { brand: "Inquine", code: "003", name: "Branco Gelo", hex: "#EFF0EC", line: "Geral" },
  { brand: "Inquine", code: "014", name: "Palha", hex: "#E6D9B0", line: "Geral" },
  { brand: "Inquine", code: "020", name: "Marfim", hex: "#ECE0C4", line: "Geral" },
  { brand: "Inquine", code: "171", name: "Gengibre", hex: "#B98A57", line: "Geral" },
  { brand: "Inquine", code: "016", name: "Camurça", hex: "#C7AE82", line: "Geral" },
  { brand: "Inquine", code: "015", name: "Areia", hex: "#D8C8A0", line: "Geral" },
  { brand: "Inquine", code: "201", name: "Tapacurá", hex: "#8B5A3C", line: "Geral" },
  { brand: "Inquine", code: "240", name: "Canjica", hex: "#F1E1B4", line: "Geral" },
  { brand: "Inquine", code: "318", name: "Onça", hex: "#6E4A2A", line: "Geral" },
  { brand: "Inquine", code: "375", name: "Caburé", hex: "#A38062", line: "Geral" },
  { brand: "Inquine", code: "007", name: "Cinza Médio", hex: "#8F8E8B", line: "Geral" },
  { brand: "Inquine", code: "435", name: "Forró", hex: "#A23B3B", line: "Geral" },
  { brand: "Inquine", code: "374", name: "Cervo", hex: "#7A5236", line: "Geral" },
  { brand: "Inquine", code: "295", name: "Azul Petróleo", hex: "#1F4E66", line: "Geral" },
  { brand: "Inquine", code: "258", name: "Kiwi", hex: "#7AA84A", line: "Geral" },
  { brand: "Inquine", code: "376", name: "Baía do Sueste", hex: "#3D6E8C", line: "Geral" },
  { brand: "Inquine", code: "209", name: "Saudade", hex: "#5E7FA8", line: "Geral" },

  // ============ INQUINE — Linha Diapiso (Piso) ============
  { brand: "Inquine", code: "002P", name: "Branco Neve", hex: "#F8F7F2", line: "Piso" },
  { brand: "Inquine", code: "012", name: "Concreto", hex: "#B0ACA3", line: "Piso" },
  { brand: "Inquine", code: "034", name: "Verde Folha", hex: "#3E8C4E", line: "Piso" },
  { brand: "Inquine", code: "051", name: "Azul Profundo", hex: "#1F3A6E", line: "Piso" },
  { brand: "Inquine", code: "008", name: "Cinza Escuro", hex: "#4D4D4B", line: "Piso" },
  { brand: "Inquine", code: "007P", name: "Cinza Médio", hex: "#8F8E8B", line: "Piso" },
  { brand: "Inquine", code: "118", name: "Amarelo Demarcação", hex: "#F2C20A", line: "Piso" },
  { brand: "Inquine", code: "018", name: "Cerâmica", hex: "#B45A3C", line: "Piso" },
  { brand: "Inquine", code: "045", name: "Vermelho", hex: "#B5302E", line: "Piso" },
  { brand: "Inquine", code: "236", name: "Saibro", hex: "#A36A48", line: "Piso" },
  { brand: "Inquine", code: "057", name: "Preto", hex: "#1A1A1A", line: "Piso" },
];

export const BRANDS = ["Hidracor", "Inquine"] as const;
export const LINES = ["Geral", "Piso"] as const;
