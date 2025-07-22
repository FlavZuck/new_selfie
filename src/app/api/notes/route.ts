import { NextRequest, NextResponse } from "next/server";

export function GET() {
	const res = new NextResponse("GET Radio Londra");
	return res;
}

export function POST() {
	const res = new NextResponse("POST Radio Londra");
	return res;
}
