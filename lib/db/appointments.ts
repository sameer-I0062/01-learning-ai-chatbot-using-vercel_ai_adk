import { getMongoClient } from "@/lib/db/mongodb";

export type AppointmentDoc = {
  purpose: string;
  dateTime: string;
  name: string;
  confirmedAt: string;
};

export async function saveAppointment(appointment: AppointmentDoc): Promise<void> {
  const client = await getMongoClient();
  await client.db().collection<AppointmentDoc>("appointments").insertOne(appointment);
}
