import Calculator from "@/components/Calculator";
import { Ruler } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl shadow-lg">
              <Ruler className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Material Weight Calculator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Calculate the weight of raw materials based on material type, shape, and dimensions.
            Professional tool for engineers and fabricators.
          </p>
        </header>

        <Calculator />

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Supports all common material shapes and densities</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
