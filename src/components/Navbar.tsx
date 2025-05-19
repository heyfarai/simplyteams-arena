"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookingBasket } from "@/components/BookingBasket";
import { useBasket } from "@/contexts/BasketContext";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Rentals", href: "/rentals" },
  { name: "Programs", href: "/programs" },
];

type BasketItem = {
  id: string;
  type: "rental" | "program";
  facilityId?: string;
  facilityName?: string;
  programId?: string;
  programName?: string;
  start: string;
  end: string;
  price: number;
};

export function Navbar() {
  const pathname = usePathname();
  const { items, removeItem, getTotal } = useBasket();

  const renderBasketItem = (item: BasketItem) => (
    <div>
      <div className="font-medium">
        {item.type === "rental" ? item.facilityName : item.programName}
      </div>
      <div className="text-sm text-muted-foreground">
        {new Date(item.start).toLocaleString()} -{" "}
        {new Date(item.end).toLocaleString()}
      </div>
    </div>
  );

  const handleRemove = (item: BasketItem) => {
    removeItem(item.id);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link
            href="/"
            className="mr-6 flex items-center space-x-2"
          >
            <span className="font-bold">SimplyTeams</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60"
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <BookingBasket
            items={items}
            renderItem={renderBasketItem}
            onRemove={handleRemove}
            getTotal={getTotal}
            onCheckout={async () => {
              // TODO: Implement checkout
              console.log("Checking out:", items);
            }}
            title="Booking Basket"
            description="Review your bookings before checkout"
          />
        </div>
      </div>
    </header>
  );
}
