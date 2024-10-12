import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ArtworkPopupProps {
  isOpen: boolean;
  onClose: () => void;
  printLocations: number;
  onConfirm: (isSameArtwork: boolean, screenFeeMultiplier: number) => void;
}

export function ArtworkPopup({ isOpen, onClose, printLocations, onConfirm }: ArtworkPopupProps) {
  const [isSameArtwork, setIsSameArtwork] = useState<boolean | null>(null);
  const [uniqueCount, setUniqueCount] = useState(2);

  useEffect(() => {
    if (isOpen) {
      setIsSameArtwork(null);
      setUniqueCount(2);
    }
  }, [isOpen]);

  const handleConfirm = (sameArtwork: boolean) => {
    const screenFeeMultiplier = sameArtwork ? 1 : (printLocations > 2 ? uniqueCount : 2);
    onConfirm(sameArtwork, screenFeeMultiplier);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Artwork Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Is the artwork the same for each placement (size, graphic, etc.)?</Label>
            <div className="flex space-x-4 mt-2">
              <Button
                variant={isSameArtwork === true ? "default" : "outline"}
                onClick={() => handleConfirm(true)}
              >
                Yes
              </Button>
              <Button
                variant={isSameArtwork === false ? "default" : "outline"}
                onClick={() => setIsSameArtwork(false)}
              >
                No
              </Button>
            </div>
          </div>
          {isSameArtwork === false && printLocations > 2 && (
            <>
              <div>
                <Label htmlFor="uniqueCount">How many unique artworks?</Label>
                <Input
                  id="uniqueCount"
                  type="number"
                  min={2}
                  max={printLocations}
                  value={uniqueCount}
                  onChange={(e) => setUniqueCount(Math.min(printLocations, Math.max(2, parseInt(e.target.value) || 2)))}
                />
              </div>
              <Button onClick={() => handleConfirm(false)}>Confirm</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
