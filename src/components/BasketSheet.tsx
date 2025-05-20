"use client";
import { useBasket } from "@/contexts/BasketContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { BookingBasket } from "@/components/BookingBasket";
import { toast } from "sonner";
import { PaymentForm } from "@/components/PaymentForm";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

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
  participantId?: string | null;
  participantName?: string | null;
};

type Participant = { id: string; name: string };

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function BasketSheet() {
  const { items, removeItem, getTotal, isOpen, setIsOpen, addItem, clear } =
    useBasket();
  const { user, loading } = useAuth();
  const [dependents, setDependents] = useState<Participant[]>([]);
  const [addDepFor, setAddDepFor] = useState<string | null>(null); // program item id
  const [newDepName, setNewDepName] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Fetch real dependents for the logged-in user
  useEffect(() => {
    if (!user) {
      setDependents([]);
      return;
    }
    fetch("/api/account/dependents")
      .then((res) => res.json())
      .then((data) => setDependents(data.dependents || []))
      .catch(() => setDependents([]));
  }, [user]);

  const allParticipants = user ? [user, ...dependents] : [];

  const handleParticipantChange = (item: BasketItem, participantId: string) => {
    const participant = allParticipants.find((p) => p.id === participantId);
    if (participant) {
      removeItem(item.id);
      addItem({
        ...item,
        id: item.id,
        participantId: participant.id,
        participantName: participant.name,
      });
    }
  };

  const handleAddDependent = async (item: BasketItem) => {
    if (newDepName.trim()) {
      try {
        const res = await fetch("/api/account/dependents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newDepName.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to add dependent");
        const newDep = data.dependent;
        // Refetch dependents from backend for consistency
        const depRes = await fetch("/api/account/dependents");
        const depData = await depRes.json();
        setDependents(depData.dependents || []);
        setAddDepFor(null);
        setNewDepName("");
        // Set this new dependent as the participant for this program
        removeItem(item.id);
        addItem({
          ...item,
          id: item.id,
          participantId: newDep.id,
          participantName: newDep.name,
        });
        toast.success("Participant added!");
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message || "Failed to add dependent");
        } else {
          toast.error("Failed to add dependent");
        }
      }
    }
  };

  // Inline validation: check if any program is missing a participant
  const missingParticipant = items.some(
    (item) => item.type === "program" && !item.participantId
  );

  const renderBasketItem = (item: BasketItem) => {
    if (item.type === "program" && user) {
      if (dependents.length === 0) {
        // No dependents: show user as participant, allow add
        return (
          <div>
            <div>
              <b>{item.programName}</b>{" "}
              <span className="text-xs text-muted-foreground">
                ({item.facilityName})
              </span>
            </div>
            <div className="text-xs text-primary">Participant: {user.name}</div>
            {addDepFor === item.id ? (
              <div className="mt-2 flex gap-2 items-center">
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="Participant name"
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => handleAddDependent(item)}
                  disabled={!newDepName.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    setAddDepFor(null);
                    setNewDepName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-5 text-xs"
                onClick={() => setAddDepFor(item.id)}
              >
                Add another participant
              </Button>
            )}
            {!item.participantId && (
              <div className="text-xs text-red-600 mt-1">
                Please select a participant
              </div>
            )}
          </div>
        );
      } else {
        // Has dependents: show dropdown
        return (
          <div>
            <div>
              <b>{item.programName}</b>{" "}
              <span className="text-xs text-muted-foreground">
                ({item.facilityName})
              </span>
            </div>
            <select
              className="w-full border rounded px-2 py-1 text-xs mt-1"
              value={item.participantId || ""}
              onChange={(e) => handleParticipantChange(item, e.target.value)}
            >
              <option
                value=""
                disabled
              >
                Select participant
              </option>
              {allParticipants.map((p) => (
                <option
                  key={p.id}
                  value={p.id}
                >
                  {p.name}
                </option>
              ))}
            </select>
            {item.participantName && (
              <div className="text-xs text-primary mt-1">
                Participant: {item.participantName}
              </div>
            )}
            {addDepFor === item.id ? (
              <div className="mt-2 flex gap-2 items-center">
                <input
                  className="w-full border rounded px-2 py-1 text-xs"
                  placeholder="Participant name"
                  value={newDepName}
                  onChange={(e) => setNewDepName(e.target.value)}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => handleAddDependent(item)}
                  disabled={!newDepName.trim()}
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs"
                  onClick={() => {
                    setAddDepFor(null);
                    setNewDepName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="link"
                size="sm"
                className="px-0 h-5 text-xs"
                onClick={() => setAddDepFor(item.id)}
              >
                Add another participant
              </Button>
            )}
            {!item.participantId && (
              <div className="text-xs text-red-600 mt-1">
                Please select a participant
              </div>
            )}
          </div>
        );
      }
    }
    // Not a program or not authed
    return (
      <div>
        <div className="font-medium">
          {item.type === "rental" ? item.facilityName : item.programName}
        </div>
        <div className="text-xs text-muted-foreground">
          {item.start} - {item.end}
        </div>
      </div>
    );
  };

  const handleRemove = (item: BasketItem) => {
    removeItem(item.id);
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsOpen(false);
      window.location.href =
        "/login?redirect_url=" + encodeURIComponent(window.location.pathname);
      return;
    }
    // Check all programs have a participant
    const missing = items.filter(
      (item) => item.type === "program" && !item.participantId
    );
    if (missing.length > 0) {
      toast.error(
        "Please select a participant for all programs before proceeding to checkout."
      );
      setIsOpen(true);
      return;
    }

    try {
      // 1. Calculate total
      const amount = getTotal() * 100; // Stripe expects cents
      // 2. Create PaymentIntent
      const response = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment intent");
      }
      const resJson = await response.json();
      console.log("Stripe intent response:", resJson);
      const { clientSecret } = resJson;
      setClientSecret(clientSecret);
      setShowPaymentForm(true);
    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create payment"
      );
    }
  };

  useEffect(() => {
    if (showPaymentForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPaymentForm]);

  return (
    <>
      <BookingBasket
        items={items}
        renderItem={renderBasketItem}
        onRemove={handleRemove}
        getTotal={getTotal}
        onCheckout={handleCheckout}
        title="Booking Basket"
        description="Review your bookings before checkout"
        open={isOpen}
        onOpenChange={setIsOpen}
        isLoading={loading}
        checkoutLabel="Proceed to Checkout"
        trigger={undefined}
        checkoutDisabled={missingParticipant}
      />
      {showPaymentForm && clientSecret && (
        <Elements stripe={stripePromise}>
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full min-h-[200px] flex flex-col justify-center">
              <PaymentForm
                clientSecret={clientSecret}
                onSuccess={() => {
                  setShowPaymentForm(false);
                  clear();
                  setIsOpen(false);
                  toast.success("Payment successful! Bookings created.");
                  // Optionally, call your booking API here if needed
                }}
                onError={(msg: string) => {
                  toast.error(msg);
                }}
              />
              <button
                className="mt-4 text-sm text-blue-600 underline"
                onClick={() => setShowPaymentForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </Elements>
      )}
    </>
  );
}
