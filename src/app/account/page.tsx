"use client";

import { Card, CardContent, CardTitle } from "@/components/ui/card";

// Mock user and bookings
const mockUser = {
  id: "user1",
  name: "Jane Customer",
  email: "jane@example.com",
};

const mockBookings = [
  {
    id: "booking1",
    program: {
      name: "Summer Basketball Camp",
      startDate: "2024-07-01",
      endDate: "2024-07-07",
    },
    participant: { id: "user1", name: "Jane Customer" },
  },
  {
    id: "booking2",
    program: {
      name: "Junior Skills Clinic",
      startDate: "2024-08-10",
      endDate: "2024-08-12",
    },
    participant: { id: "dep1", name: "Little Customer" },
  },
];

export default function AccountPage() {
  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="mb-2 font-semibold">{mockUser.name}</div>
          <div className="text-sm text-muted-foreground">{mockUser.email}</div>
        </CardContent>
      </Card>
      <h2 className="text-xl font-semibold mb-2">Booked Programs</h2>
      {mockBookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings yet.</p>
      ) : (
        <div className="space-y-4">
          {mockBookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-4">
                <CardTitle>{booking.program.name}</CardTitle>
                <div className="text-sm text-muted-foreground mb-1">
                  {new Date(booking.program.startDate).toLocaleDateString()} -{" "}
                  {new Date(booking.program.endDate).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Participant:</span>{" "}
                  {booking.participant.name}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
