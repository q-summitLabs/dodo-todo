import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Task from "@/models/Task";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const listId = searchParams.get("listId");

  if (!listId) {
    return NextResponse.json({ error: "List ID is required" }, { status: 400 });
  }

  await dbConnect();
  const tasks = await Task.find({ user: session.user.id, listId }).sort({
    createdAt: -1,
  });
  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { title, listId, dueDate, description, subtasks } =
    await request.json();
  const task = await Task.create({
    title,
    listId,
    description,
    user: session.user.id,
    dueDate: dueDate || null,
    subtasks: subtasks || [],
  });
  return NextResponse.json(task, { status: 201 });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id, title, completed, dueDate, description, subtasks } =
    await request.json();
  const task = await Task.findOneAndUpdate(
    { _id: id, user: session.user.id },
    { title, completed, dueDate, description, subtasks },
    { new: true }
  );
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json(task);
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { id } = await request.json();
  const task = await Task.findOneAndDelete({ _id: id, user: session.user.id });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json({ message: "Task deleted successfully" });
}
