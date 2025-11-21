import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(req : Request){
    try{
        const user = await getAuthenticatedUser();

        if(!user || user.role !== 'admin'){
            return NextResponse.json({error: "Unauthorized"}, {status: 401});
        }

        const totalConsumers = await prisma.users.count(
            {where: {role:'consumer'}}
        );
        const totalWorkers = await prisma.users.count(
            {where: {role:'worker'}}
        );
        const totalShops = await prisma.shops.count();
        const totalOrders = await prisma.orders.count();

        return NextResponse.json({
            stats: {
            consumers: totalConsumers,
            workers: totalWorkers,
            shops: totalShops,
            orders: totalOrders
        }
        });
    }catch(error){
        console.error("Error fetching dashboard stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}