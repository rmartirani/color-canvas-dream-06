import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Brush,
  Eraser,
  PaintBucket,
  Undo2,
  Trash2,
  Download,
  Eye,
  EyeOff,
  Pipette,
  Calculator,
  Settings2,
  X,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import { CATALOG, BRANDS, type PaintColor } from "@/data/catalog";
import { applyPaint, bucketFill, paintStroke } from "@/lib/paint/blend";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type Tool = "brush" | "eraser" | "bucket";

export function PaintStudio() {
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseImageData = useRef<ImageData | null>(null);
  const outImageData = useRef<ImageData | null>(null);
  const mask = useRef<Uint8Array | null>(null);
  const history = useRef<Uint8Array[]>([]);
  const drawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const [hasImage, setHasImage] = useState(false);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState<PaintColor>(CATALOG[26]); // Verde Folha
  const [brushSize, setBrushSize] = useState(40);
  const [tolerance, setTolerance] = useState(28);
  const [realism, setRealism] = useState(0.85);
  const [showOriginal, setShowOriginal] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [brand, setBrand] = useState<"Todas" | (typeof BRANDS)[number]>("Todas");
  const [search, setSearch] = useState("");

  // Calculadora
  const [wallMeters, setWallMeters] = useState(3); // largura real aproximada da foto em metros
  const [coats, setCoats] = useState(2);
  const [yieldPerL, setYieldPerL] = useState(10);
  const [pricePerL, setPricePerL] = useState(0);

  const filteredColors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOG.filter(
      (c) =>
        (brand === "Todas" || c.brand === brand) &&
        (q === "" ||
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q)),
    );
  }, [brand, search]);

  // Render — desenha base + máscara colorida no canvas visível
  const render = useCallback(() => {
    const canvas = baseCanvasRef.current;
    const base = baseImageData.current;
    const m = mask.current;
    const out = outImageData.current;
    if (!canvas || !base || !m || !out) return;
    const ctx = canvas.getContext("2d")!;
    if (showOriginal) {
      ctx.putImageData(base, 0, 0);
      return;
    }
    applyPaint(base, m, color.hex, realism, out);
    ctx.putImageData(out, 0, 0);
  }, [color.hex, realism, showOriginal]);

  useEffect(() => {
    render();
  }, [render]);

  const loadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1600;
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        const k = MAX / Math.max(w, h);
        w = Math.round(w * k);
        h = Math.round(h * k);
      }
      const canvas = baseCanvasRef.current!;
      canvas.width = w;
      canvas.height = h;
      const overlay = overlayRef.current!;
      overlay.width = w;
      overlay.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      baseImageData.current = ctx.getImageData(0, 0, w, h);
      outImageData.current = ctx.createImageData(w, h);
      mask.current = new Uint8Array(w * h);
      history.current = [];
      setHasImage(true);
      requestAnimationFrame(render);
      toast.success("Foto carregada");
    };
    img.onerror = () => toast.error("Não foi possível abrir a imagem");
    img.src = url;
  };

  const pushHistory = () => {
    if (!mask.current) return;
    history.current.push(new Uint8Array(mask.current));
    if (history.current.length > 30) history.current.shift();
  };

  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    mask.current = prev;
    render();
  };

  const clearMask = () => {
    if (!mask.current) return;
    pushHistory();
    mask.current.fill(0);
    render();
  };

  // Coordenadas do canvas a partir do toque/click
  const getCanvasPoint = (e: React.PointerEvent) => {
    const canvas = baseCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    return { x: Math.round(x), y: Math.round(y) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasImage || !baseImageData.current || !mask.current) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    pushHistory();
    const p = getCanvasPoint(e);
    if (tool === "bucket") {
      bucketFill(baseImageData.current, mask.current, p.x, p.y, tolerance);
      render();
      return;
    }
    drawing.current = true;
    lastPoint.current = p;
    const w = baseCanvasRef.current!.width;
    const h = baseCanvasRef.current!.height;
    const r = (brushSize / 2) * (w / baseCanvasRef.current!.getBoundingClientRect().width);
    paintStroke(mask.current, w, h, p.x, p.y, r, tool === "eraser");
    render();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawing.current || !mask.current || !baseCanvasRef.current) return;
    const p = getCanvasPoint(e);
    const w = baseCanvasRef.current.width;
    const h = baseCanvasRef.current.height;
    const r =
      (brushSize / 2) * (w / baseCanvasRef.current.getBoundingClientRect().width);
    const last = lastPoint.current ?? p;
    // Interpolar pontos para traço contínuo
    const dx = p.x - last.x;
    const dy = p.y - last.y;
    const dist = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(dist / (r / 2)));
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      paintStroke(
        mask.current,
        w,
        h,
        last.x + dx * t,
        last.y + dy * t,
        r,
        tool === "eraser",
      );
    }
    lastPoint.current = p;
    render();
  };

  const onPointerUp = () => {
    drawing.current = false;
    lastPoint.current = null;
  };

  const exportPng = () => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `simpaint-${color.code}.png`;
    a.click();
    toast.success("Imagem exportada");
  };

  // ---- Cálculo de área pintada ----
  const paintedStats = useMemo(() => {
    if (!hasImage || !mask.current || !baseCanvasRef.current)
      return { ratio: 0, area: 0, liters: 0, cost: 0 };
    let painted = 0;
    const m = mask.current;
    for (let i = 0; i < m.length; i++) if (m[i] > 0) painted++;
    const ratio = painted / m.length;
    const w = baseCanvasRef.current.width;
    const h = baseCanvasRef.current.height;
    const aspect = h / w;
    const totalArea = wallMeters * (wallMeters * aspect); // m²
    const area = totalArea * ratio;
    const liters = (area * coats) / Math.max(1, yieldPerL);
    const cost = liters * pricePerL;
    return { ratio, area, liters, cost };
  }, [hasImage, wallMeters, coats, yieldPerL, pricePerL, color.hex]);

  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground">
      {/* Topbar */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-3">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 rounded-md"
            style={{
              background:
                "linear-gradient(135deg, var(--ember), oklch(0.55 0.18 30))",
            }}
          />
          <span className="text-sm font-semibold tracking-tight">SimPaint</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Abrir foto"
          >
            <Upload className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={!hasImage}
            onClick={undo}
            aria-label="Desfazer"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={!hasImage}
            onClick={exportPng}
            aria-label="Exportar"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) loadFile(f);
          e.target.value = "";
        }}
      />

      {/* Canvas área */}
      <div
        ref={containerRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden bg-[oklch(0.14_0.005_60)]"
      >
        {!hasImage ? (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mx-6 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface/60 px-8 py-12 text-center transition hover:bg-surface"
          >
            <Upload className="h-8 w-8 text-ember" />
            <div>
              <p className="text-base font-medium">Carregar foto da parede</p>
              <p className="mt-1 text-xs text-muted-foreground">
                JPEG, PNG ou WebP — do celular ou galeria
              </p>
            </div>
          </button>
        ) : (
          <div className="relative max-h-full max-w-full">
            <canvas
              ref={baseCanvasRef}
              className="block max-h-[calc(100dvh-12rem)] max-w-full touch-none select-none rounded-md shadow-2xl"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
            <canvas ref={overlayRef} className="pointer-events-none absolute inset-0 hidden" />
            {/* Antes/Depois toggle */}
            <button
              onPointerDown={() => setShowOriginal(true)}
              onPointerUp={() => setShowOriginal(false)}
              onPointerLeave={() => setShowOriginal(false)}
              className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-3 py-1.5 text-xs text-white backdrop-blur"
            >
              {showOriginal ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {showOriginal ? "Original" : "Antes"}
            </button>
          </div>
        )}
      </div>

      {/* Color bar — sempre visível */}
      <div className="flex items-center gap-2 border-t border-border bg-surface px-3 py-2">
        <button
          onClick={() => setPaletteOpen(true)}
          className="flex flex-1 items-center gap-3 rounded-xl bg-surface-elevated px-3 py-2 text-left transition active:scale-[0.98]"
        >
          <div
            className="h-9 w-9 shrink-0 rounded-lg border border-border shadow-inner"
            style={{ backgroundColor: color.hex }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{color.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {color.brand} · {color.code}
            </p>
          </div>
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        </button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setCalcOpen(true)}
          aria-label="Calculadora"
        >
          <Calculator className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar inferior */}
      <div className="flex items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] pt-1">
        <ToolBtn
          active={tool === "brush"}
          onClick={() => setTool("brush")}
          icon={<Brush className="h-5 w-5" />}
          label="Pincel"
        />
        <ToolBtn
          active={tool === "bucket"}
          onClick={() => setTool("bucket")}
          icon={<PaintBucket className="h-5 w-5" />}
          label="Balde"
        />
        <ToolBtn
          active={tool === "eraser"}
          onClick={() => setTool("eraser")}
          icon={<Eraser className="h-5 w-5" />}
          label="Borracha"
        />
        <ToolBtn
          onClick={() => setSettingsOpen(true)}
          icon={<Settings2 className="h-5 w-5" />}
          label="Ajustes"
        />
        <ToolBtn
          onClick={clearMask}
          icon={<Trash2 className="h-5 w-5" />}
          label="Limpar"
        />
      </div>

      {/* Paleta */}
      <Sheet open={paletteOpen} onOpenChange={setPaletteOpen}>
        <SheetContent side="bottom" className="h-[85dvh] p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle>Catálogo de cores</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-3 p-4">
            <Input
              placeholder="Buscar por nome ou código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex gap-2">
              {(["Todas", ...BRANDS] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs transition",
                    brand === b
                      ? "border-ember bg-ember text-ember-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div className="grid max-h-[calc(85dvh-9.5rem)] grid-cols-3 gap-2 overflow-y-auto px-4 pb-6 sm:grid-cols-4">
            {filteredColors.map((c) => (
              <button
                key={`${c.brand}-${c.code}`}
                onClick={() => {
                  setColor(c);
                  setPaletteOpen(false);
                }}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-lg border bg-surface-elevated text-left transition active:scale-95",
                  color.code === c.code && color.brand === c.brand
                    ? "border-ember ring-2 ring-ember"
                    : "border-border",
                )}
              >
                <div
                  className="h-16 w-full"
                  style={{ backgroundColor: c.hex }}
                />
                <div className="px-2 py-1.5">
                  <p className="truncate text-xs font-medium">{c.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {c.brand} · {c.code}
                  </p>
                </div>
              </button>
            ))}
            {filteredColors.length === 0 && (
              <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
                Nenhuma cor encontrada
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Ajustes */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle>Ajustes</SheetTitle>
          </SheetHeader>
          <div className="space-y-5 px-4 py-5">
            <SliderRow
              label="Tamanho do pincel"
              value={brushSize}
              min={5}
              max={150}
              onChange={setBrushSize}
              suffix="px"
            />
            <SliderRow
              label="Tolerância do balde"
              value={tolerance}
              min={1}
              max={80}
              onChange={setTolerance}
            />
            <SliderRow
              label="Realismo da tinta"
              value={Math.round(realism * 100)}
              min={20}
              max={100}
              onChange={(v) => setRealism(v / 100)}
              suffix="%"
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Calculadora */}
      <Sheet open={calcOpen} onOpenChange={setCalcOpen}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle>Calculadora de tinta</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4 py-5">
            <div className="rounded-xl bg-surface-elevated p-4">
              <p className="text-xs text-muted-foreground">Área pintada</p>
              <p className="text-2xl font-semibold">
                {paintedStats.area.toFixed(2)} m²
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({Math.round(paintedStats.ratio * 100)}% da foto)
                </span>
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Litros</p>
                  <p className="text-lg font-semibold text-ember">
                    {paintedStats.liters.toFixed(2)} L
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Custo</p>
                  <p className="text-lg font-semibold">
                    R$ {paintedStats.cost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Largura real da foto (m)"
                value={wallMeters}
                onChange={setWallMeters}
                step={0.1}
              />
              <NumberInput
                label="Demãos"
                value={coats}
                onChange={setCoats}
                step={1}
              />
              <NumberInput
                label="Rendimento (m²/L)"
                value={yieldPerL}
                onChange={setYieldPerL}
                step={1}
              />
              <NumberInput
                label="Preço por litro (R$)"
                value={pricePerL}
                onChange={setPricePerL}
                step={1}
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Dica: meça a largura aproximada da parede que aparece na foto e use
              esse valor para calibrar a área real.
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function ToolBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] transition",
        active
          ? "text-ember"
          : "text-muted-foreground active:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg",
          active && "bg-ember/15",
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-xs text-muted-foreground">
          {value}
          {suffix}
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={1}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </div>
  );
}
