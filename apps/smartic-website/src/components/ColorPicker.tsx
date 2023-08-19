"use client";

import { HexAlphaColorPicker } from "react-colorful";

import { useCanvasStore } from "@/stores/canvasStore";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ColorPicker() {
  const [strokeColor, setStrokeColor] = useCanvasStore((state) => [
    state.strokeColor,
    state.setStrokeColor,
  ]);

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-8 w-8 rounded-xs rounded-br-sm p-0 ">
            <div
              className="h-full w-full rounded-xs rounded-br-sm"
              style={{ background: strokeColor }}
            />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-fit">
          <HexAlphaColorPicker
            id="strokeColor"
            color={strokeColor}
            onChange={setStrokeColor}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
