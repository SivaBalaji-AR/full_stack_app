import {prisma} from "@/lib/prisma";
import {NextResponse} from "next/server";
import {getAuthenticatedUser} from "@/lib/auth" 

export async function GET(
    req: Request,
){
    try{
        const user = await getAuthenticatedUser();
        if(!user || user.role !== "admin"){
            return NextResponse.json({message: "Unauthorized"}, {status: 401});
        }

        const { searchParams } = new URL(req.url);
            
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
            
        const skip = (page - 1) * limit;

        const [consumers, total] = await prisma.$transaction([
                prisma.shops.findMany({
                    skip: skip,
                    take: limit,
                    orderBy: { created_at: 'desc' }, 
                    select: {
                        id: true,
                        name: true,
                        created_at: true,
                        address: true,
                        type: true,
                        admin:{
                            select: {
                                id: true,
                                name: true,
                                phone_number: true
                            }
                        }
                    }
                }),
                prisma.shops.count()
            ]);

        return NextResponse.json({
                data: consumers,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
    }catch(error){
        console.error("Error fetching shops:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}