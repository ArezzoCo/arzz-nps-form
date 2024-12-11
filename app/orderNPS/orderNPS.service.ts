import { OrderNPS, Prisma } from "@prisma/client";
import db from "../db.server";

export async function GetOrderNPS(id: number): Promise<OrderNPS | null> {
  const orderNPS = await db.orderNPS.findUnique({
    where: { id },
    include: {
      form: true,
    }
  });

  return orderNPS;
}

export async function GetOrdersNPS(): Promise<OrderNPS[]> {
  const ordersNPS = await db.orderNPS.findMany()

  return ordersNPS;
}

export async function CreateOrderNPS(data: Prisma.OrderNPSCreateInput): Promise<OrderNPS> {
  const orderNPS = await db.orderNPS.create({
    data
  })

  return orderNPS
}

export async function UpdateOrderNPS(id: number, data: Prisma.OrderNPSUpdateInput): Promise<OrderNPS> {
  const orderNPS = await db.orderNPS.update({
    where: { id },
    data
  })

  return orderNPS
}

export async function DeleteOrderNPS(id: number): Promise<OrderNPS> {
  const orderNPS = await db.orderNPS.delete({
    where: { id }
  })

  return orderNPS
}