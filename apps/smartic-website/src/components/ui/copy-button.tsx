"use client";

import { useEffect, useState } from "react";
import { AiOutlineCheck as Check, AiOutlineCopy as Copy } from "react-icons/ai";

import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";

interface CopyButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
}

export default function CopyButton({ value }: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setHasCopied(false), 2000);

    return () => clearTimeout(timeout);
  }, [hasCopied]);

  return (
    <Button
      type="button"
      variant="ghost"
      className="h-fit rounded-sm p-0 hover:bg-background"
      onClick={() => {
        copyToClipboard(value);
        setHasCopied(true);
      }}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}
