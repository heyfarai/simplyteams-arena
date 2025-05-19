"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBasket } from "@/contexts/BasketContext";

type Program = {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  facilityId: string;
  facilityName: string;
};

export default function Home() {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { addItem } = useBasket();

  React.useEffect(() => {
    // Fetch programs on mount
    fetch("/api/programs?date=" + new Date().toISOString().split("T")[0])
      .then((res) => res.json())
      .then((data) => {
        setPrograms(data.programs || []);
      })
      .catch((error) => {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAddToBasket = (program: Program) => {
    addItem({
      id: program.id,
      type: "program",
      programId: program.id,
      programName: program.name,
      facilityId: program.facilityId,
      facilityName: program.facilityName,
      start: program.startDate,
      end: program.endDate,
      price: program.price,
    });
  };

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Available Programs</h1>
      {loading ? (
        <div className="text-center py-8">Loading programs...</div>
      ) : programs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No programs available at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card
              key={program.id}
              className="flex flex-col justify-between"
            >
              <CardHeader>
                <CardTitle>{program.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {program.description}
                </p>
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <div className="font-medium">${program.price}</div>
                    <div className="text-muted-foreground">
                      {program.facilityName}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => handleAddToBasket(program)}
                  >
                    Add to Basket
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
