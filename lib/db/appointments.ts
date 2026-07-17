import { getMongoClient } from "@/lib/db/mongodb";
import type { AppointmentDoc } from "@/types/appointment";

export async function saveAppointment(appointment: AppointmentDoc): Promise<void> {
  const client = await getMongoClient();
  await client.db().collection<AppointmentDoc>("appointments").insertOne(appointment);
}
