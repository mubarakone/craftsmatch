"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  const router = useRouter();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams();
    
    // Add all existing search params except page
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, v));
        } else {
          params.append(key, value);
        }
      }
    });
    
    // Add the new page param
    params.set("page", page.toString());
    
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    router.push(createPageUrl(page));
  };

  if (totalPages <= 1) {
    return null;
  }

  // Generate page numbers
  const getPageItems = () => {
    const items = [];
    const maxItems = 7; // Maximum number of page items to show
    const sideItems = 1; // Number of pages to show on each side of current page

    // Always include first page
    items.push(1);

    // Calculate start and end of range
    let rangeStart = Math.max(2, currentPage - sideItems);
    let rangeEnd = Math.min(totalPages - 1, currentPage + sideItems);

    // Adjust range to show max items if possible
    if (rangeEnd - rangeStart + 3 < maxItems) {
      rangeStart = Math.max(2, Math.min(rangeStart, totalPages - maxItems + 2));
      rangeEnd = Math.min(totalPages - 1, Math.max(rangeEnd, maxItems - 3));
    }

    // Add ellipsis before range if needed
    if (rangeStart > 2) {
      items.push(-1);
    }

    // Add range of pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      items.push(i);
    }

    // Add ellipsis after range if needed
    if (rangeEnd < totalPages - 1) {
      items.push(-2);
    }

    // Always include last page if there is more than one page
    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  };

  const pageItems = getPageItems();

  return (
    <nav className="flex justify-center items-center space-x-1 mt-8">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage <= 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Previous page</span>
      </Button>

      {pageItems.map((page, i) => {
        if (page < 0) {
          return (
            <Button
              key={`ellipsis-${i}`}
              variant="outline"
              size="icon"
              className="h-8 w-8 cursor-default"
              disabled
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">More pages</span>
            </Button>
          );
        }

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(page)}
          >
            {page}
            <span className="sr-only">Page {page}</span>
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={currentPage >= totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Next page</span>
      </Button>
    </nav>
  );
} 