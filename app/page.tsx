"use client";

import React, { useState } from "react";
import {
  useForm,
  SubmitHandler,
  UseFormRegister,
  UseFormWatch,
  UseFormSetValue,
  Controller,
} from "react-hook-form";
import Image from "next/image";
import { Moon, Sun, Plus, Receipt, Pin, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ArtworkPopup } from "@/components/ArtworkPopup";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormInputs = {
  garmentColor: "light" | "dark" | undefined;
  printLocations: number | undefined;
  colorCount: number | undefined;
  brand: string;
  [key: `gmt${string}`]: string | number;
};

interface Item {
  name: string;
  unitPrice: number;
  darkUnitPrice: number;
  emoji: string;
}

interface Estimate {
  id: string;
  parts: EstimateItem[];
  total: number;
  name?: string;
  isPinned?: boolean;
  screenFee: number;
}

interface EstimateItem {
  name: string;
  quantity: number;
  unitPrice: number;
  darkUnitPrice: number;
  total: number;
  printLocations: number;
  colorCount: number;
  isDark: boolean;
  printCost: number;
  brand: string;
  emoji: string;
}

const items: Item[] = [
  { name: "T-Shirt", unitPrice: 5, darkUnitPrice: 6, emoji: "👕" },
  { name: "Crewneck", unitPrice: 11, darkUnitPrice: 13, emoji: "⛴️" },
  { name: "Hoodie", unitPrice: 18, darkUnitPrice: 20, emoji: "🥷🏿" },
  { name: "Long Sleeve", unitPrice: 9, darkUnitPrice: 11, emoji: "🥼" },
];

const brands = ["Gildan", "Bella + Canvas", "Next Level", "American Apparel"];

const calculateUnitPrice = (quantity: number): number => {
  // This is a placeholder pricing logic. Adjust according to your actual pricing strategy.
  if (quantity < 12) return 15;
  if (quantity < 24) return 12;
  if (quantity < 48) return 10;
  if (quantity < 100) return 8;
  return 6;
};

const BrandSelector = ({
  onValueChange,
  value,
}: {
  onValueChange: (value: string) => void;
  value: string;
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? brands.find((brand) => brand === value) : "Select brand..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search brand..." />
          <CommandList>
            <CommandEmpty>No brand found.</CommandEmpty>
            <CommandGroup>
              {brands.map((brand) => (
                <CommandItem
                  key={brand}
                  value={brand}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === brand ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {brand}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const GarmentQuantityInput = ({
  item,
  register,
  watch,
  setValue,
}: {
  item: Item;
  register: UseFormRegister<FormInputs>;
  watch: UseFormWatch<FormInputs>;
  setValue: UseFormSetValue<FormInputs>;
}) => {
  const quantity = watch(`gmt${item.name}` as const);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "") {
      setValue(`gmt${item.name}`, 0);
    } else {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 0) {
        setValue(`gmt${item.name}`, numValue);
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label
        htmlFor={`gmt${item.name}`}
        className="block text-center font-bold"
      >
        {item.name} {item.emoji}
      </Label>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() =>
            setValue(
              `gmt${item.name}`,
              Math.max(0, (Number(quantity) || 0) - 1),
            )
          }
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          id={`gmt${item.name}`}
          {...register(`gmt${item.name}`, {
            valueAsNumber: true,
            min: 0,
            onChange: handleInputChange,
          })}
          className="w-20 text-center"
          min="0"
          step="1"
          value={quantity === 0 ? "" : quantity}
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() =>
            setValue(`gmt${item.name}`, (Number(quantity) || 0) + 1)
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  className?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
  cancelText,
  className,
}) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent className={className}>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel
          onClick={onCancel}
          className="group bg-lime-800 transition-colors hover:bg-lime-600 hover:text-white"
        >
          <Pin className="mr-2 h-4 w-4 transition-colors group-hover:fill-white" />
          {cancelText}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          className="bg-red-800 text-white transition-colors hover:bg-red-950"
        >
          <X className="mr-2 h-4 w-4" />
          <span>{confirmText}</span>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

const groupEstimateItems = (
  items: EstimateItem[],
): Record<string, EstimateItem[]> => {
  const groupedItems: Record<string, EstimateItem[]> = {};
  const itemCounts: Record<string, number> = {};

  items.forEach((item) => {
    const baseKey = item.name;
    const fullKey = `${item.name}-${item.printLocations}-${item.colorCount}-${item.isDark}-${item.brand}`;

    if (!groupedItems[fullKey]) {
      groupedItems[fullKey] = [];
      itemCounts[baseKey] = (itemCounts[baseKey] || 0) + 1;
    }

    groupedItems[fullKey].push(item);
  });

  const finalGroupedItems: Record<string, EstimateItem[]> = {};

  Object.entries(groupedItems).forEach(([key, items]) => {
    const [name] = key.split("-");
    let displayName = name;

    if (itemCounts[name] > 1) {
      const existingKeys = Object.keys(finalGroupedItems).filter((k) =>
        k.startsWith(name),
      );
      if (existingKeys.length > 0) {
        displayName = `${name} ${existingKeys.length + 1}`;
      }
    }

    finalGroupedItems[displayName] = items;
  });

  return finalGroupedItems;
};

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentEstimate, setCurrentEstimate] = useState<Estimate | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showCalculateButton, setShowCalculateButton] = useState(false);
  const [isArtworkPopupOpen, setIsArtworkPopupOpen] = useState(false);
  const [pinnedEstimates, setPinnedEstimates] = useState<Estimate[]>([]);
  const [formError, setFormError] = useState("");
  const [isEstimateCalculated, setIsEstimateCalculated] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isNewEstimateDialogOpen, setIsNewEstimateDialogOpen] = useState(false);
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);
  const [estimateName, setEstimateName] = useState("");
  const [showAddToEstimate, setShowAddToEstimate] = useState(true);
  const [isFirstEstimate, setIsFirstEstimate] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    getValues,
    formState: { errors },
    clearErrors,
  } = useForm<FormInputs>({
    defaultValues: {
      garmentColor: undefined,
      printLocations: undefined,
      colorCount: undefined,
      brand: "",
    },
  });
  const { toast } = useToast();

  const resetFormFields = () => {
    reset({
      garmentColor: undefined,
      printLocations: undefined,
      colorCount: undefined,
      brand: "",
      ...items.reduce((acc, item) => ({ ...acc, [`gmt${item.name}`]: "" }), {}),
    });
    setValue("brand", "");
    setValue("printLocations", undefined);
    setValue("colorCount", undefined);
    setValue("garmentColor", undefined);
    items.forEach((item) => setValue(`gmt${item.name}`, ""));
  };

  const addToEstimate: SubmitHandler<FormInputs> = (data) => {
    setIsFirstEstimate(false);
    setFormError("");
    clearErrors();

    const emptyFields = Object.entries(data).filter(
      ([key, value]) =>
        value === "" ||
        value === undefined ||
        (key.startsWith("gmt") && Number(value) === 0),
    );

    if (emptyFields.length > 0) {
      setFormError(
        `Please fill in the following fields: ${emptyFields.map(([key]) => key).join(", ")}`,
      );
      return;
    }

    const negativeFields = Object.entries(data).filter(
      ([key, value]) => key.startsWith("gmt") && Number(value) < 0,
    );

    if (negativeFields.length > 0) {
      setFormError(
        `Quantity cannot be negative for: ${negativeFields.map(([key]) => key.substring(3)).join(", ")}`,
      );
      return;
    }

    if (Number(data.printLocations) > 1) {
      setIsArtworkPopupOpen(true);
    } else {
      processEstimate(data, 1); // Pass 1 as the screen fee multiplier for single location prints
    }
  };

  const processEstimate = (data: FormInputs, screenFeeMultiplier: number) => {
    const newItems = items
      .map((item) => {
        const quantity = Number(data[`gmt${item.name}`]) || 0;
        if (quantity === 0) return null;
        const unitPrice = calculateUnitPrice(quantity);
        const isDark = data.garmentColor === "dark";
        const darkUnitPrice = isDark ? unitPrice + 1 : unitPrice;
        const printCost = calculatePrintCost(
          Number(data.colorCount),
          Number(data.printLocations),
        );
        return {
          ...item,
          quantity,
          unitPrice,
          darkUnitPrice,
          isDark,
          printCost,
          total: quantity * (isDark ? darkUnitPrice : unitPrice) + printCost,
          printLocations: Number(data.printLocations),
          colorCount: Number(data.colorCount),
          brand: data.brand,
        } as EstimateItem;
      })
      .filter((item): item is EstimateItem => item !== null);
    const total = newItems.reduce((sum, item) => sum + item.total, 0);
    const screenFee = calculateScreenFee(newItems, screenFeeMultiplier);
    setCurrentEstimate((prevEstimate) => {
      if (prevEstimate) {
        return {
          ...prevEstimate,
          parts: [...prevEstimate.parts, ...newItems],
          total: prevEstimate.total + total + screenFee,
          screenFee: prevEstimate.screenFee + screenFee,
        };
      } else {
        return {
          id: Date.now().toString(),
          parts: newItems,
          total: total + screenFee,
          screenFee,
        };
      }
    });
    setShowCalculateButton(true);
    setShowAddToEstimate(true);
    resetFormFields();
  };

  const calculateEstimate = () => {
    if (currentEstimate) {
      setIsEstimateCalculated(true);
      setIsDrawerOpen(true);
    }
  };

  const calculatePrintCost = (
    colorCount: number,
    printLocations: number,
  ): number => {
    // This is a placeholder. Adjust the calculation based on your actual pricing strategy.
    return colorCount * printLocations * 0.5;
  };

  const calculateScreenFee = (
    items: EstimateItem[],
    screenFeeMultiplier: number,
  ): number => {
    if (items.length === 0) return 0;
    const uniqueLocations = new Set(items.map((item) => item.printLocations));
    return uniqueLocations.size * 20 * screenFeeMultiplier;
  };

  const pinEstimate = () => {
    if (!currentEstimate) return;
    setIsNamePromptOpen(true);
  };

  const handleNameSubmit = () => {
    if (estimateName && currentEstimate) {
      const pinnedEstimate: Estimate = {
        ...currentEstimate,
        name: estimateName,
        isPinned: true,
      };
      setPinnedEstimates((prevEstimates) => [...prevEstimates, pinnedEstimate]);
      setCurrentEstimate(null);
      setIsDrawerOpen(false);
      setIsNamePromptOpen(false);
      setEstimateName("");
      toast({
        title:`"${estimateName}" has been pinned`,
        description: "(hint: feel free to start over, your pinned estimates are safe!)",
        action: (
          <ToastAction
            altText="View Estimate"
            onClick={() => openDrawer(pinnedEstimate)}
          >
            View
          </ToastAction>
        ),
      });
    }
  };

  const openDrawer = (estimate: Estimate) => {
    setCurrentEstimate(estimate);
    setIsDrawerOpen(true);
  };

  const handleArtworkConfirm = async (
    isSameArtwork: boolean,
    screenFeeMultiplier: number,
  ) => {
    // Close the popup
    setIsArtworkPopupOpen(false);

    // Wait a short time to ensure the popup is closed before showing the toast
    await new Promise(resolve => setTimeout(resolve, 100));
    // Show a toast to confirm 
    toast({
      title: "Estimate Added",
      description: "(hint: click 'Add to Estimate' to add more to your order)",
    });

    const formData = getValues();
    processEstimate(formData, screenFeeMultiplier);
  };

  const resetEstimate = () => {
    setCurrentEstimate(null);
    setShowCalculateButton(false);
    setIsEstimateCalculated(false);
    resetFormFields();
    setIsDrawerOpen(false);
    setShowAddToEstimate(true); // Reset this when clearing the estimate
    toast({
      title:
        "Current Estimate Cleared",
      description: "(hint: pinned estimates are safe!)",
    });
    setIsFirstEstimate(true);
  };

  const handleDeleteConfirm = () => {
    setCurrentEstimate(null);
    setShowCalculateButton(false);
    setIsEstimateCalculated(false);
    resetFormFields();
    setIsDrawerOpen(false);
    setIsDeleteConfirmOpen(false);
    setShowAddToEstimate(true); // Reset this when deleting the estimate
    toast({
      title: "Estimate Deleted",
      description: "You can now start a new estimate.",
    });
  };

  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    pinEstimate();
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <div
      className={`min-h-screen p-4 ${isDarkMode ? "dark bg-black" : "bg-stone-200"}`}
    >
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-lg dark:bg-black">
        <div className="mb-8 flex items-center justify-between">
          <Image src="/logo.png" alt="MSA Logo" width={200} height={200} />
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full border-2 border-black dark:border-white"
          >
            {isDarkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </div>

        <h1 className="mb-4 text-center text-3xl font-bold dark:text-white">
          Screen-Print Estimator 🖨️
        </h1>

        <div className="mx-auto mb-6 max-w-2xl text-pretty text-left text-gray-600 dark:text-gray-300">
          <h2 className="font-extrabold mb-4">Follow these steps to create your estimate:</h2>
          <ul className="list-none space-y-2">
            <li>
              • 👕 Select a Brand and identify the brightness of your fabric
              <p className="text-sm font-extralight ml-6">
                (hint: darker colored fabrics require a white ink underbase)
              </p>
            </li>
            <li>
              • ➕ Use &quot;Add to Estimate&quot; for multi-part estimates
              <p className="text-sm font-extralight ml-6">
                (hint: orders with both dark and light garments or combining blanks from multiple brands)
              </p>
            </li>
            <li>
              • 🖼️ Add multiple print locations for each design
              <p className="text-sm font-extralight ml-6">
                (hint: for example, a full back + front left-chest pocket)
              </p>
            </li>
            <li>
              • 🏷️ Fill out the form separately for each design and each brand
              of blanks
            </li>
            <li>• 📌 Pin estimates to save them for later</li>
            <li>• 🔄 Use &apos;New Estimate&apos; to start over at any time</li>
          </ul>
        </div>

        {(isEstimateCalculated || currentEstimate) && !isFirstEstimate && (
          <>
            <Button
              onClick={() => setIsNewEstimateDialogOpen(true)}
              className="mb-4 w-full bg-indigo-400 font-semibold text-white hover:bg-violet-700"
            >
              New Estimate
            </Button>

            <AlertDialog
              open={isNewEstimateDialogOpen}
              onOpenChange={setIsNewEstimateDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Start a New Estimate?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Do you want to start over and clear the current estimate?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      resetEstimate();
                      setIsNewEstimateDialogOpen(false);
                    }}
                    className="bg-red-700 text-white transition-colors hover:bg-red-950"
                  >
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}

        <form onSubmit={handleSubmit(addToEstimate)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand" className="text-md font-extrabold">
              Choose a blanks brand
            </Label>
            <Controller
              name="brand"
              control={control}
              rules={{ required: "Brand is required" }}
              render={({ field }) => (
                <BrandSelector
                  onValueChange={field.onChange}
                  value={field.value}
                />
              )}
            />
            {errors.brand && (
              <p className="text-red-500">{errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="garmentColor" className="text-md font-extrabold">
              Light or Dark garment?
            </Label>
            <p className="text-sm font-extralight ">
              (hint: darker colored fabrics require a white underbase to print
              on)
            </p>
            <Controller
              name="garmentColor"
              control={control}
              rules={{ required: "Garment color is required" }}
              render={({ field }) => (
                <RadioGroup onValueChange={field.onChange} value={field.value}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light ⚪</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark ⚫</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.garmentColor && (
              <p className="text-red-500">{errors.garmentColor.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="printLocations" className="text-md font-extrabold">
              How many graphic placements are required for this design?
            </Label>
            <p className="text-sm font-extralight ">
              (hint: if you have a design that requires a full back and a front
              left chest pocket, that&apos;s 2 graphic placements)
            </p>
            <Controller
              name="printLocations"
              control={control}
              rules={{ required: "Print locations are required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select print locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "📍" : "📍".repeat(num)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.printLocations && (
              <p className="text-red-500">{errors.printLocations.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-md font-extrabold" htmlFor="colorCount">
              How many colors are in this design?
            </Label>
            <p className="text-sm font-extralight">
              (hint: if 2 or more graphic placements, count only the unique
              colors)
            </p>
            <Controller
              name="colorCount"
              control={control}
              rules={{ required: "Color count is required" }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color count" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num === 5
                          ? "5+ colors 🌈"
                          : `${num} color${num > 1 ? "s" : ""} ${"🎨".repeat(num)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.colorCount && (
              <p className="text-red-500">{errors.colorCount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-extrabold text-md">
              How many of each garment? 
            </Label>
            <p className="text-sm font-extralight">(hint: leave it blank for zero)</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {items.map((item) => (
                <GarmentQuantityInput
                  key={item.name}
                  item={item}
                  register={register}
                  watch={watch}
                  setValue={setValue}
                />
              ))}
            </div>

          {showAddToEstimate && (
            <Button
              type="submit"
              className={`w-full font-semibold text-white group ${
                isFirstEstimate
                  ? "bg-pink-600 hover:bg-pink-400"
                  : "bg-violet-950 hover:dark:bg-violet-700"
              }`}
            >
              {isFirstEstimate ? (
                <>
                  Create an Estimate <Receipt className="group ml-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                </>
              ) : (
                <>
                  Add to Estimate <Plus className="group ml-2 h-4 w-4 group-hover:animate-spin-once" />
                </>
              )}
            </Button>
          )}
          {formError && <p className="text-red-500">{formError}</p>}
        </form>

        {showCalculateButton && (
          <Button
            type="button"
            onClick={calculateEstimate}
            className="mt-4 w-full bg-lime-800 font-semibold text-white hover:bg-lime-500"
          >
            <span className="font-semibold">Calculate Estimate 🚀</span>
          </Button>
        )}

        {isEstimateCalculated && (
          <Button type="button" onClick={resetEstimate} className="mt-4 w-full hover:text-white hover:bg-red-800 transition-colors">
            Start Over
          </Button>
        )}

        <Drawer
          open={isDrawerOpen}
          onOpenChange={(open) => {
            if (!open && currentEstimate && !currentEstimate.isPinned) {
              setIsDeleteConfirmOpen(true);
            } else {
              setIsDrawerOpen(open);
            }
          }}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {currentEstimate?.name || "Your Estimate"} 📊
              </DrawerTitle>
              <DrawerDescription>
                Here&apos;s a breakdown of your screen-print estimate
              </DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[80vh] overflow-y-auto p-4">
              {currentEstimate && (
                <>
                  {Object.entries(
                    groupEstimateItems(currentEstimate.parts),
                  ).map(([key, items], index) => (
                    <div key={index} className="mb-8">
                      <h3 className="mb-2 text-lg font-semibold">{key}</h3>
                      <div className="mb-4">
                        <p>Print Locations: {items[0].printLocations}</p>
                        <p>Colors in Design: {items[0].colorCount}</p>
                        <p>
                          Garment Color: {items[0].isDark ? "Dark" : "Light"}
                        </p>
                        <p>Brand: {items[0].brand}</p>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/3">Item</TableHead>
                            <TableHead className="w-1/12">Quantity</TableHead>
                            <TableHead className="w-1/6">Unit Price</TableHead>
                            <TableHead className="w-1/6">Print Cost</TableHead>
                            <TableHead className="w-1/6">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item, itemIndex) => (
                            <TableRow key={itemIndex}>
                              <TableCell className="w-1/3">
                                {item.emoji} {item.name}
                              </TableCell>
                              <TableCell className="w-1/12">
                                {item.quantity}
                              </TableCell>
                              <TableCell className="w-1/6">
                                $
                                {item.isDark
                                  ? item.darkUnitPrice.toFixed(2)
                                  : item.unitPrice.toFixed(2)}
                              </TableCell>
                              <TableCell className="w-1/6">
                                ${item.printCost.toFixed(2)}
                              </TableCell>
                              <TableCell className="w-1/6">
                                ${item.total.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ))}
                  <div className="mt-4">
                    <p>Screen Fee: ${currentEstimate.screenFee.toFixed(2)}</p>
                    <p className="font-bold">
                      Total: ${currentEstimate.total.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={pinEstimate}
                    className="group mt-4 flex w-full items-center bg-lime-800 text-white hover:bg-lime-600"
                  >
                    <Pin className="group mr-2 h-4 w-4 transition-opacity group-hover:fill-white" />
                    Pin
                  </Button>
                  <Button
                    onClick={() => {
                      setIsNewEstimateDialogOpen(true);
                      setIsDrawerOpen(false);
                    }}
                    className="mt-2 flex w-full items-center transition-colors duration-300 hover:bg-red-600 hover:text-white"
                  >
                    <X className="mr-2 h-4 w-4 font-semibold" />
                    Start Over
                  </Button>
                </>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      </div>
      <ArtworkPopup
        isOpen={isArtworkPopupOpen}
        printLocations={Number(watch("printLocations"))}
        onConfirm={handleArtworkConfirm}
      />
      {currentEstimate && (
        <div className="mt-8 flex justify-center">
          <div className="w-48 max-w-md">
            <h2
              className={`mb-4 text-center text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}
            >
              Current Estimate
            </h2>
            <div className="mb-4 justify-center rounded-lg bg-black p-4 text-center shadow">
              <p className="text-center font-black">
                Subtotal: ${currentEstimate.total.toFixed(2)}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDrawerOpen(true)}
                className="mt-2 w-32 font-semibold hover:bg-violet-700 hover:text-white"
              >
                Details 👀
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col items-center">
        <h2
          className={`mb-4 text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}
        >
          Pinned 📌
        </h2>
        <div className="w-full max-w-md">
          {pinnedEstimates.map((estimate, index) => (
            <div
              key={index}
              className="mb-4 rounded-lg bg-white p-4 shadow dark:bg-black"
            >
              <h3 className="text-lg font-semibold">{estimate.name}</h3>
              <p className="mt-2 font-bold">
                Total: ${estimate.total.toFixed(2)}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openDrawer(estimate)}
                className="mt-2 w-full font-semibold hover:bg-violet-700 hover:text-white"
              >
                View Details
              </Button>
            </div>
          ))}
        </div>
      </div>
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Pin or delete this estimate?"
        description="You can pin this estimate to save it, or delete it to start over."
        confirmText="Delete"
        cancelText="Pin"
        className="text-white"
      />
      <Dialog open={isNamePromptOpen} onOpenChange={setIsNamePromptOpen}>
        <DialogContent
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleNameSubmit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              setIsNamePromptOpen(false);
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Name Your Estimate</DialogTitle>
            <DialogDescription>
              <span className="font-bold">
                Name your estimate (ex. &apos;Tour Merch&apos;):
              </span>
            </DialogDescription>
          </DialogHeader>
          <Input
            value={estimateName}
            onChange={(e) => setEstimateName(e.target.value)}
            placeholder="Estimate name"
            autoFocus
          />
          <DialogFooter>
            <Button
              onClick={() => setIsNamePromptOpen(false)}
              className="bg-red-800 text-white hover:bg-red-950"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNameSubmit}
              className="bg-lime-800 text-white hover:bg-lime-600"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}