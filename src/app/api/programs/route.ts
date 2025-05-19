import { NextResponse } from "next/server";

const keystoneApiUrl = process.env.NEXT_PUBLIC_KEYSTONE_API_URL as string;

type Program = {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  facilityId: string;
  facilityName: string;
};

type RawProgram = {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  facility?: {
    id: string;
    name: string;
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json(
      { error: "Date parameter is required" },
      { status: 400 }
    );
  }

  if (!keystoneApiUrl) {
    return NextResponse.json(
      { error: "Keystone API URL is not configured." },
      { status: 500 }
    );
  }

  // Build a filter for programs that are active and overlap with the selected date
  // (Assume startDate and endDate are ISO strings)
  const filter = `where: { AND: [ { isActive: { equals: true } }, { startDate: { lte: \"${date}T23:59:59.999Z\" } }, { endDate: { gte: \"${date}T00:00:00.000Z\" } } ] }`;

  const query = `
    query {
      programs(${filter}) {
        id
        name
        description
        price
        startDate
        endDate
        facility {
          id
          name
        }
      }
    }
  `;

  try {
    const res = await fetch(keystoneApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Failed to fetch programs: ${errorText}` },
        { status: 500 }
      );
    }
    const { data, errors } = await res.json();
    if (errors) {
      return NextResponse.json(
        { error: "GraphQL error", details: errors },
        { status: 500 }
      );
    }
    // Map facility fields for frontend compatibility
    const programs: Program[] = (data.programs || []).map(
      (p: RawProgram): Program => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        startDate: p.startDate,
        endDate: p.endDate,
        facilityId: p.facility?.id || "",
        facilityName: p.facility?.name || "",
      })
    );
    return NextResponse.json({ programs });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error fetching programs.", details: String(err) },
      { status: 500 }
    );
  }
}
