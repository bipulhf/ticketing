"use client";

import { logout } from "@/actions/auth.action";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useState } from "react";

export const LogoutButton = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      variant="outline"
      disabled={isLoading}
      className="flex justify-start items-center gap-2 cursor-pointer w-full border-none bg-transparent ring-0 outline-none"
      onClick={async () => {
        setIsLoading(true);
        await logout();
        router.push("/login");
        setIsLoading(false);
      }}
    >
      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <>
          <LogOut />
          Logout
        </>
      )}
    </Button>
  );
};
