import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ArtworkPopupProps {
  isOpen: boolean;
  printLocations: number;
  onConfirm: (isSameArtwork: boolean, screenFeeMultiplier: number) => Promise<void>;
}

export function ArtworkPopup({ isOpen, printLocations, onConfirm }: ArtworkPopupProps) {
  const [isSameArtwork, setIsSameArtwork] = useState<boolean | null>(null);
  const [uniqueCount, setUniqueCount] = useState(2);

  useEffect(() => {
    if (isOpen) {
      setIsSameArtwork(null);
      setUniqueCount(2);
    }
  }, [isOpen]);

  const handleConfirm = async (sameArtwork: boolean) => {
    const uniquePlacements = sameArtwork ? 1 : (printLocations > 2 ? uniqueCount : 2);
    const setupFee = uniquePlacements * 20; // $20 fixed Screen Fee per placement
    await onConfirm(sameArtwork, setupFee);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">How many unique graphics?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-center">
          <div>
            <Label className="text-center text-pretty">Is the artwork exactly the same for each placement (size, graphic, etc.)?</Label>
            <div className="flex justify-center space-x-4 mt-2">
              <Button
                variant={isSameArtwork === true ? "default" : "outline"}
                onClick={() => handleConfirm(true)}
              >
                Yes
              </Button>
              <Button
                variant={isSameArtwork === false ? "default" : "outline"}
                onClick={() => {
                  setIsSameArtwork(false);
                  if (printLocations <= 2) {
                    handleConfirm(false);
                  }
                }}
              >
                No
              </Button>
            </div>
          </div>
          {isSameArtwork === false && printLocations > 2 && (
            <>
              <div>
                <Label htmlFor="uniqueCount" className="text-center">How many unique artworks?</Label>
                <Select
                  value={uniqueCount.toString()}
                  onValueChange={(value) => setUniqueCount(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select number of unique artworks" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: printLocations - 1 }, (_, i) => i + 2).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleConfirm(false)}>Confirm</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
