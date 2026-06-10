"use client";

import Dexie, { Table } from "dexie";
import { Task } from "../types";

// Let's declare our Dexie database class
export class BeehiveDatabase extends Dexie {
  tasks!: Table<Task>;

  constructor() {
    super("BeehiveDatabase");
    this.version(1).stores({
      tasks: "id, title, completed, priority, category, pollenUnits, columnId",
    });
  }
}

export const db = new BeehiveDatabase();

export async function seedDatabaseIfEmpty() {}
