import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Configure notification handler with proper types
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// ✅ Ask permissions safely
export async function requestNotificationPermissions(): Promise<{ status: string; message?: string }> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            return { status: "failed", message: "Notification permission denied" };
        }

        // Configure notification channel for Android
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("reminders", {
                name: "MyApp Reminders",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#00A5FF",
            });
        }

        return { status: "granted" };
    } catch (err: unknown) {
        const error = err as Error;
        console.error(error);
        return { status: "failed", message: error.message || "Permission error" };
    }
}

export async function getAppCalendar(): Promise<string | null> {
    // This function is no longer needed for notifications
    // Kept for compatibility, returns a dummy value
    return "notifications-enabled";
}

type RecurrenceInterval = "daily" | "weekly" | "monthly" | number;

interface RecurrenceRule {
    interval: RecurrenceInterval;
}

// ✅ Create recurring notification
export async function createRecurringEventAndroid(
    title: string,
    body: string,
    hour: number,
    minute: number,
    recurrenceRule: RecurrenceRule,
    endDate?: Date | null
): Promise<{ success: boolean; eventId?: string; message?: string }> {
    try {
        const trigger = calculateTrigger(hour, minute, recurrenceRule.interval, endDate);

        if (!trigger) {
            return { success: false, message: "Invalid recurrence interval" };
        }

        const eventId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                ...(Platform.OS === "android" && {
                    channelId: "reminders",
                }),
            },
            trigger,
        });

        return { success: true, eventId };
    } catch (err: unknown) {
        const error = err as Error;
        return { success: false, message: error.message || "Error creating recurring notification" };
    }
}

// ✅ One-time reminder
export async function createOneTimeReminder(
    title: string,
    body: string,
    date: Date
): Promise<{ success: boolean; eventId?: string; message?: string }> {
    try {
        console.log("Input date::: ", date);

        const now = new Date();
        const triggerDate = new Date(date);

        if (triggerDate <= now) {
            return { success: false, message: "Date must be in the future" };
        }

        const eventId = await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                ...(Platform.OS === "android" && {
                    channelId: "reminders",
                }),
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });

        console.log("Trigger date: ", triggerDate);
        console.log("Notification ID: ", eventId);

        return { success: true, eventId };
    } catch (err: unknown) {
        const error = err as Error;
        return { success: false, message: error.message || "Error creating one-time reminder" };
    }
}

// ✅ Delete reminder safely
export async function deleteReminder(eventId: string): Promise<{ success: boolean; message?: string }> {
    try {
        await Notifications.cancelScheduledNotificationAsync(eventId);
        return { success: true };
    } catch (err: unknown) {
        const error = err as Error;
        return { success: false, message: error.message || "Error deleting reminder" };
    }
}

// Helper function to calculate trigger based on recurrence
function calculateTrigger(
    hour: number,
    minute: number,
    interval: RecurrenceInterval,
    endDate?: Date | null
): Notifications.NotificationTriggerInput | null {
    const now = new Date();
    const triggerDate = new Date();
    triggerDate.setHours(hour, minute, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (triggerDate <= now) {
        triggerDate.setDate(triggerDate.getDate() + 1);
    }

    // Check if endDate is in the past
    if (endDate && endDate <= now) {
        return null; // Don't schedule if end date has passed
    }

    const baseConfig = (endDate && endDate > now) ? { endDate: endDate.getTime() } : {};

    if (interval === "daily") {
        return {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour,
            minute,
            ...baseConfig,
        };
    } else if (interval === "weekly") {
        return {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: triggerDate.getDay() + 1, // 1 = Sunday, 2 = Monday, etc.
            hour,
            minute,
            ...baseConfig,
        };
    } else if (interval === "monthly") {
        return {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            day: triggerDate.getDate(),
            hour,
            minute,
            repeats: true,
            ...baseConfig,
        };
    } else if (typeof interval === "number" && interval > 0) {
        // For "repeat every N days", use seconds-based trigger
        const secondsUntilFirst = Math.floor((triggerDate.getTime() - now.getTime()) / 1000);
        
        return {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: secondsUntilFirst,
            repeats: true,
            ...baseConfig,
        };
    }

    return null;
}

// Example usage:
// Daily notification at 8:00 AM
// createRecurringEventAndroid("Daily reminder", "Do something", 8, 0, {
//   interval: "daily"
// });

// Daily notification with end date
// createRecurringEventAndroid("Daily reminder", "Do something", 8, 0, {
//   interval: "daily"
// }, new Date('2025-12-31'));

// Weekly notification at 9:30 AM
// createRecurringEventAndroid("Weekly check", "Check something", 9, 30, {
//   interval: "weekly"
// });

// Monthly notification at 10:00 AM with end date
// createRecurringEventAndroid("Monthly reminder", "Monthly task", 10, 0, {
//   interval: "monthly"
// }, new Date('2026-01-01'));

// Every 3 days at 10:00 AM
// createRecurringEventAndroid("Every 3 days", "Reminder body", 10, 0, {
//   interval: 3
// });

export async function getEventById(notificationId: string): Promise<Notifications.NotificationRequest | null> {
    try {
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        const notification = scheduledNotifications.find(n => n.identifier === notificationId);
        
        if (notification) {
            console.log(notification);
            return notification;
        }
        
        return null;
    } catch (error) {
        console.error("Error getting notification:", error);
        return null;
    }
}