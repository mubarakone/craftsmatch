"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  defaultValue?: string;
}

export function SearchBar({
  placeholder = "Search for products, materials, or artisans...",
  className,
  autoFocus,
  defaultValue = "",
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(
    defaultValue || searchParams?.get("query") || ""
  );

  useEffect(() => {
    setSearchTerm(searchParams?.get("query") || "");
  }, [searchParams]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    const params = new URLSearchParams(searchParams?.toString());
    params.set("query", searchTerm);
    params.set("page", "1");
    
    router.push(`/marketplace?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm("");
    if (searchParams.has("query")) {
      router.push("/marketplace");
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className={cn("relative w-full max-w-md", className)}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus={autoFocus}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="absolute right-0 top-0 h-full rounded-l-none px-3"
          disabled={!searchTerm.trim()}
        >
          Search
        </Button>
      </div>
    </form>
  );
} 