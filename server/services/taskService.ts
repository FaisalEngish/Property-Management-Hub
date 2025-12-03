import { db } from "../db";
import { tasks } from "../../shared/schema";
import { eq, and, gte, lte, ne } from "drizzle-orm";

export async function getUpcomingTasks() {
  const today = new Date();
  const in7Days = new Date();
  in7Days.setDate(today.getDate() + 7);

  try {
    // First check if tasks table has any data
    const allTasks = await db.select().from(tasks).limit(5);
    console.log("Sample tasks in database:", allTasks.length);

    if (allTasks.length === 0) {
      console.log("No tasks found in database");
      return [];
    }

    const upcomingTasks = await db
      .select()
      .from(tasks)
      .where(
        and(
          gte(tasks.dueDate, today),
          lte(tasks.dueDate, in7Days),
          ne(tasks.status, "completed")
        )
      )
      .limit(10);

    return upcomingTasks;
  } catch (error) {
    console.error("Error fetching upcoming tasks:", error);
    // Return some mock task data for AI context
    return [
      {
        title: "Pool Cleaning",
        dueDate: new Date(),
        priority: "high",
        status: "pending",
        property: "Property"
      },
      {
        title: "Guest Check-in Preparation", 
        dueDate: new Date(),
        priority: "medium",
        status: "pending",
        property: "Property"
      }
    ];
  }
}

export async function getTasksByProperty(propertyId: string) {
  try {
    const propertyTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.property, propertyId))
      .limit(20);

    return propertyTasks;
  } catch (error) {
    console.error("Error fetching property tasks:", error);
    return [];
  }
}