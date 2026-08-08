import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const scan = await prisma.scan.findUnique({
      where: { id },
    });

    if (!scan || scan.userId !== userId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    await prisma.scan.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete scan" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const scan = await prisma.scan.findUnique({
      where: { id },
    });

    if (!scan || scan.userId !== userId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Update only the fields provided in the request body
    const updatedScan = await prisma.scan.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : scan.title,
        isStarred: body.isStarred !== undefined ? body.isStarred : scan.isStarred,
      },
    });

    return NextResponse.json({ success: true, scan: updatedScan });
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update scan" }, { status: 500 });
  }
}