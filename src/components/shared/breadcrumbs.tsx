import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  homeHref?: string;
  showHome?: boolean;
}

export function Breadcrumbs({
  items,
  className,
  homeHref = "/",
  showHome = true,
}: BreadcrumbsProps) {
  const allItems = showHome
    ? [{ label: "Home", href: homeHref }, ...items]
    : items;

  return (
    <nav className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0 && showHome;

          // Use Home icon for the first item if showHome is true
          const itemContent = isFirst ? (
            <Home className="h-4 w-4" />
          ) : (
            <span>{item.label}</span>
          );

          return (
            <li
              key={index}
              className={cn(
                "flex items-center",
                isLast && "text-foreground font-medium"
              )}
            >
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition-colors hover:text-foreground",
                    !isLast && "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {itemContent}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>
                  {itemContent}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
} 