import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShapeSelector from "./ShapeSelector";
import DimensionInputs from "./DimensionInputs";
import ResultsDisplay from "./ResultsDisplay";
import UnitToggle from "./UnitToggle";
import { Material, ShapeType, Unit, CalculationResult } from "@/types/calculator";
import { calculateVolume, calculateWeight } from "@/utils/calculations";
import materialsData from "@/data/materials.json";
import { Calculator as CalcIcon } from "lucide-react";

const Calculator = () => {
  const materials = materialsData as Material[];
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedSubtype, setSelectedSubtype] = useState<number>(-1);
  const [selectedShape, setSelectedShape] = useState<ShapeType | null>(null);
  const [unit, setUnit] = useState<Unit>("mm");
  const [dimensions, setDimensions] = useState<Record<string, number>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleCalculate = () => {
    if (!selectedMaterial || !selectedShape) return;

    const density =
      selectedSubtype >= 0
        ? selectedMaterial.subtypes[selectedSubtype].density
        : selectedMaterial.density;

    const volumeM3 = calculateVolume(selectedShape, dimensions, unit);
    const { volumeCm3, weightKg, weightLbs } = calculateWeight(volumeM3, density);

    const calculationResult: CalculationResult = {
      material: selectedMaterial.name,
      subtype:
        selectedSubtype >= 0
          ? selectedMaterial.subtypes[selectedSubtype].name
          : undefined,
      shape: selectedShape,
      dimensions: { ...dimensions },
      unit,
      volumeCm3,
      volumeM3,
      weightKg,
      weightLbs,
      timestamp: Date.now(),
    };

    setResult(calculationResult);
  };

  const handleReset = () => {
    setSelectedMaterial(null);
    setSelectedSubtype(-1);
    setSelectedShape(null);
    setDimensions({});
    setResult(null);
  };

  const isFormValid =
    selectedMaterial &&
    selectedShape &&
    Object.keys(dimensions).length > 0 &&
    Object.values(dimensions).every((v) => v > 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="p-6 bg-gradient-to-br from-card to-muted/20 shadow-lg border-2">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalcIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Material Calculator</h2>
                <p className="text-sm text-muted-foreground">
                  Calculate weight from dimensions
                </p>
              </div>
            </div>
            <UnitToggle unit={unit} onUnitChange={setUnit} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-semibold mb-2 block">Material</Label>
              <Select
                value={selectedMaterial?.name || ""}
                onValueChange={(value) => {
                  const material = materials.find((m) => m.name === value);
                  if (material) {
                    setSelectedMaterial(material);
                    setSelectedSubtype(-1);
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {materials.map((material) => (
                    <SelectItem key={material.name} value={material.name}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Grade</Label>
              <Select
                value={selectedSubtype.toString()}
                onValueChange={(value) => setSelectedSubtype(parseInt(value))}
                disabled={!selectedMaterial}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={selectedMaterial ? "Select grade" : "Select material first"} />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {selectedMaterial ? (
                    selectedMaterial.subtypes.length === 0 ? (
                      <SelectItem value="-1">Standard ({selectedMaterial.density} kg/m³)</SelectItem>
                    ) : (
                      selectedMaterial.subtypes.map((subtype, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {subtype.name} ({subtype.density} kg/m³)
                        </SelectItem>
                      ))
                    )
                  ) : (
                    <SelectItem value="-1" disabled>
                      Select a material first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Shape</Label>
              <ShapeSelector
                selectedShape={selectedShape}
                onShapeChange={(shape) => {
                  setSelectedShape(shape);
                  setDimensions({});
                }}
              />
            </div>
          </div>

          {selectedShape && (
            <div>
              <Label className="text-sm font-semibold mb-2 block">
                Dimensions ({unit})
              </Label>
              <DimensionInputs
                shape={selectedShape}
                dimensions={dimensions}
                onDimensionsChange={setDimensions}
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCalculate}
              disabled={!isFormValid}
              className="flex-1"
              size="lg"
            >
              Calculate Weight
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
            >
              Reset
            </Button>
          </div>
        </div>
      </Card>

      {result && <ResultsDisplay result={result} />}
    </div>
  );
};

export default Calculator;
