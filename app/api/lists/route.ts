import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import List from "@/models/List";
import Task from "@/models/Task";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const lists = await List.find({ user: session.user.id }).sort({
    createdAt: -1,
  });
  return NextResponse.json(lists);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { name } = await request.json();
  const list = await List.create({ name, user: session.user.id });
  return NextResponse.json(list, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "List ID is required" }, { status: 400 });
  }

  await dbConnect();

  // Delete the list
  const deletedList = await List.findOneAndDelete({
    _id: id,
    user: session.user.id,
  });

  if (!deletedList) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  // Delete all tasks associated with the list
  await Task.deleteMany({ listId: id, user: session.user.id });

  return NextResponse.json({
    message: "List and associated tasks deleted successfully",
  });
}
