// Serves JSON-backed card catalog
import cards from "@/data/cards.json";

export async function GET() {
  return Response.json(cards);
}