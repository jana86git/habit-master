import * as Calendar from "expo-calendar";

// ✅ Ask permissions safely
export async function requestCalendarPermissions() {
    try {
        const cal = await Calendar.requestCalendarPermissionsAsync();
      
        console.log("#### cal: ", cal);

        if (cal.status !== "granted") {
            return { status: "failed", message: "Calendar permission denied" };
        }

       



        return { status: "granted" };
    } catch (err: any) {
        console.error(err)
        return { status: "failed", message: err.message || "Permission error" };
    }
}





export async function getAppCalendar() {
    try {
       
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

        // Prefer Google source
        let source = calendars.find(c =>
            c.source && c.source.type === "com.google"
        )?.source;

        // Fallback: a synced account calendar
        if (!source) {
            source = calendars.find(c =>
                c.source && c.source.type === "ACCOUNT"
            )?.source;
        }

        // Last fallback: use the first non-local calendar
        if (!source) {
            source = calendars.find(c =>
                c.source && c.source.type !== "LOCAL"
            )?.source;
        }

        const existing = calendars.find(c => c.title === "MyApp Reminders");
        if (existing) return existing.id;

        if (!source) return;
        const id = await Calendar.createCalendarAsync({
            title: "MyApp Reminders",
            color: "#00A5FF",
            entityType: Calendar.EntityTypes.EVENT,
            sourceId: source.id,
            source,
            name: "MyApp Reminders",
            ownerAccount: source.name,
            accessLevel: Calendar.CalendarAccessLevel.OWNER,
            allowedReminders: [
                Calendar.AlarmMethod.ALARM,
                Calendar.AlarmMethod.DEFAULT
            ]
        });

        return id;
    } catch (error) {
        return null
    }

}




// ✅ Create recurring event (safe)
export async function createRecurringEventAndroid(
    title: string,
    body: string,
    hour: number,
    minute: number,
    recurrenceRule: Calendar.RecurrenceRule
) {
    try {
       
        const calendarId = await getAppCalendar();

        const start = new Date();
        start.setHours(hour, minute, 0, 0);

        if (start <= new Date()) {
            start.setDate(start.getDate() + 1);
        }

        const end = new Date(start.getTime() + 5 * 60 * 1000);
        if (!calendarId) return { success: false, message: "Calendar not found" }

        const eventId = await Calendar.createEventAsync(calendarId, {
            title,
            notes: body,
            startDate: start,
            endDate: end,
            recurrenceRule,
            alarms: [
                {
                    absoluteDate: start.toISOString(),          // ✅ Android reliable trigger
                    method: Calendar.AlarmMethod.ALARM, // ✅ REQUIRED on Android
                }
            ],
        });

        return { success: true, eventId };
    } catch (err: any) {
        return { success: false, message: err.message || "Error creating recurring event" };
    }
}

// ✅ One-time reminder (safe)
export async function createOneTimeReminder(
    title: string,
    body: string,
    date: Date
) {
    try {
       
        const calendarId = await getAppCalendar();

        console.log("Input date::: ", date)

        const start = new Date(date);
        const end = new Date(start.getTime() + 5 * 60 * 1000);
        if (!calendarId) return { success: false, message: "Calendar not found" }
        const eventId = await Calendar.createEventAsync(calendarId, {
            title,
            notes: body,
            startDate: start,
            endDate: end,
            alarms: [
                {
                    absoluteDate: start.toISOString(),          // ✅ Android reliable trigger
                    method: Calendar.AlarmMethod.ALARM, // ✅ REQUIRED on Android
                }
            ],
        });

        console.log("Start: ", start);
        console.log("End: ", end);
        console.log("4: EVENT ID ", eventId);

        return { success: true, eventId };
    } catch (err: any) {
        return { success: false, message: err.message || "Error creating one-time reminder" };
    }
}

// ✅ Delete reminder safely
export async function deleteReminder(eventId: string) {
    try {
        await Calendar.deleteEventAsync(eventId, { futureEvents: true });
        return { success: true };
    } catch (err: any) {
        return { success: false, message: err.message || "Error deleting reminder" };
    }
}




// // Daily:
// createRecurringEventAndroid("My daily reminder", "Do something", 8, 0, {
//   frequency: Calendar.Frequency.DAILY
// });

// // Weekly on Monday (weekDay = 2 if Sunday = 1 etc):
// createRecurringEventAndroid("Weekly check", "Check something", 9, 30, {
//   frequency: Calendar.Frequency.WEEKLY,
//   interval: 1,
//   daysOfWeek: [{ dayOfWeek: 2 }]
// });

// // Every N days, say every 3 days:
// createRecurringEventAndroid("Every 3 days", "Reminder body", 10, 0, {
//   frequency: Calendar.Frequency.DAILY,
//   interval: 3
// });

export async function getEventById() {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

   
    const data = await Calendar.getEventAsync("1160");
    console.log(data)

}
