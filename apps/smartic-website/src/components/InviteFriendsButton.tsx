import * as React from "react";
import { AiOutlinePlus } from "react-icons/ai";

import { Button } from "./ui/button";
import { AiOutlineCheck as Check } from "react-icons/ai";
import { copyToClipboard } from "@/lib/utils";
import { useToast } from "./ui/use-toast";

export function InviteFriendsButton({ roomId }: { roomId: string }) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    const timeout = setTimeout(() => setHasCopied(false), 2000);

    return () => clearTimeout(timeout);
  }, [hasCopied]);

  return (
    <>
      <Button
        variant={"outline"}
        className="flex rounded-md px-3 py-2 text-sm font-medium hover:text-gray-300 cursor-pointer border border-border justify-between items-center gap-2 w-full"
        onClick={() => {
          copyToClipboard(roomId);
          setHasCopied(true);
          toast({
            description: "Room id copied. Send it to your friend.",
          });
        }}
      >
        <span>Invite friends</span>
        {hasCopied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <AiOutlinePlus className="w-4 h-4" />
        )}
      </Button>
    </>
  );
}
