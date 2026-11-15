"use client";

import { useEffect, useState } from "react";
import { getOrgConfig } from "@/lib/orgConfig";
import { ChipMultiSelect } from "../../components";
import { getColors } from "@/services/color.service";
import { getSizes } from "@/services/size.service";
import { ColorRead } from "@/interfaces/IColor";
import { SizeRead } from "@/interfaces/ISize";
import { PriceMatrixEditor } from "./PriceMatrixEditor";
import { PriceRow } from "../hooks";

interface SingleProductFieldsProps {
  colorIds: number[];
  sizeIds: number[];
  onColorsChange: (ids: number[]) => void;
  onSizesChange: (ids: number[]) => void;
  priceRows: PriceRow[];
  onPriceChange: (row: PriceRow, value: string) => void;
}

export function SingleProductFields({
  colorIds,
  sizeIds,
  onColorsChange,
  onSizesChange,
  priceRows,
  onPriceChange,
}: SingleProductFieldsProps) {
  const [colors, setColors] = useState<ColorRead[]>([]);
  const [sizes, setSizes] = useState<SizeRead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { schoolId } = getOrgConfig();
    Promise.all([getColors({ schoolId }), getSizes({ schoolId })])
      .then(([colorsData, sizesData]) => {
        setColors(colorsData);
        setSizes(sizesData);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <ChipMultiSelect
        label="Colores"
        options={colors.map((color) => ({ id: color.id, label: color.description }))}
        selectedIds={colorIds}
        onChange={onColorsChange}
        loading={loading}
        emptyMessage="No hay colores registrados."
      />
      <ChipMultiSelect
        label="Tallas"
        options={sizes.map((size) => ({ id: size.id, label: size.description }))}
        selectedIds={sizeIds}
        onChange={onSizesChange}
        loading={loading}
        emptyMessage="No hay tallas registradas."
      />

      <PriceMatrixEditor
        rows={priceRows}
        onChange={onPriceChange}
        colors={colors}
        sizes={sizes}
      />
    </div>
  );
}
