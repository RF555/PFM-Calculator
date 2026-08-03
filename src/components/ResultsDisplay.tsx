import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalculationResult } from "@/types/calculator";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

interface ResultsDisplayProps {
  result: CalculationResult;
}

const shapeLabels: Record<string, string> = {
  sheet: "Sheet / Plate",
  roundBar: "Round Bar",
  squareBar: "Square Bar",
  flatBar: "Flat Bar",
  hexBar: "Hexagonal Bar",
  roundTubeOuter: "Round Tube (Outer)",
  roundTubeInner: "Round Tube (Inner)",
  rectangularHollow: "Rectangular Hollow",
  squareHollow: "Square Hollow",
  angle: "Angle (L-profile)",
};

const ResultsDisplay = ({ result }: ResultsDisplayProps) => {
  const handleCopy = () => {
    const text = `
Material: ${result.material}${result.subtype ? ` (${result.subtype})` : ""}
Shape: ${shapeLabels[result.shape]}
Volume: ${result.volumeCm3.toFixed(2)} cm³ (${result.volumeM3.toExponential(4)} m³)
Weight: ${result.weightKg.toFixed(2)} kg (${result.weightLbs.toFixed(2)} lbs)
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success("Results copied to clipboard");
  };

  const handleShare = async () => {
    const text = `Material Weight: ${result.weightKg.toFixed(2)} kg - ${result.material}${
      result.subtype ? ` (${result.subtype})` : ""
    }`;

    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch (err) {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 shadow-xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-foreground">Calculation Results</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="p-3 bg-card rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Material</p>
              <p className="font-semibold text-foreground">
                {result.material}
                {result.subtype && (
                  <span className="text-sm text-muted-foreground ml-2">({result.subtype})</span>
                )}
              </p>
            </div>

            <div className="p-3 bg-card rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Shape</p>
              <p className="font-semibold text-foreground">{shapeLabels[result.shape]}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-card rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Volume</p>
              <p className="font-semibold text-lg text-primary">
                {result.volumeCm3.toFixed(2)} cm³
              </p>
              <p className="text-xs text-muted-foreground">
                ({result.volumeM3.toExponential(4)} m³)
              </p>
            </div>

            <div className="p-3 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/30">
              <p className="text-xs text-muted-foreground mb-1">Weight</p>
              <p className="font-bold text-2xl text-primary">{result.weightKg.toFixed(2)} kg</p>
              <p className="text-sm text-muted-foreground">({result.weightLbs.toFixed(2)} lbs)</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsDisplay;
