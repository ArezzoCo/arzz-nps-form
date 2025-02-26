import { OrderNPS, Prisma } from "@prisma/client";
import db from "../../db.server";

export async function CreateOrderNPS(data: Prisma.OrderNPSCreateInput): Promise<OrderNPS> {
  const orderNPS = await db.orderNPS.create({
    data
  })

  return orderNPS
}