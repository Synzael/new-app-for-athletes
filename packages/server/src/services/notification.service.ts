import { PushToken } from "../entity/PushToken";
import { Athlete } from "../entity/Athlete";

interface ExpoPushMessage {
  to: string;
  sound?: "default" | null;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  priority?: "default" | "normal" | "high";
  badge?: number;
}

interface ExpoPushTicket {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: {
    error?: string;
  };
}

/**
 * Service for sending push notifications via Expo Push Notification Service
 */
export class NotificationService {
  private static readonly EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

  /**
   * Check if a token is a valid Expo push token
   */
  private static isExpoPushToken(token: string): boolean {
    return (
      token.startsWith("ExponentPushToken[") ||
      token.startsWith("ExpoPushToken[")
    );
  }

  /**
   * Send push notifications to multiple tokens
   */
  static async sendPushNotifications(
    messages: ExpoPushMessage[]
  ): Promise<ExpoPushTicket[]> {
    if (messages.length === 0) {
      return [];
    }

    // Filter to only valid Expo push tokens
    const validMessages = messages.filter((m) => this.isExpoPushToken(m.to));

    if (validMessages.length === 0) {
      console.log("No valid Expo push tokens to send to");
      return [];
    }

    try {
      // Chunk messages into batches of 100 (Expo limit)
      const chunks: ExpoPushMessage[][] = [];
      for (let i = 0; i < validMessages.length; i += 100) {
        chunks.push(validMessages.slice(i, i + 100));
      }

      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        const response = await fetch(this.EXPO_PUSH_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chunk),
        });

        const data = await response.json();
        if (data.data) {
          tickets.push(...data.data);
        }
      }

      return tickets;
    } catch (error) {
      console.error("Failed to send push notifications:", error);
      return [];
    }
  }

  /**
   * Send a push notification to a specific user
   */
  static async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    const tokens = await PushToken.find({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      console.log(`No active push tokens for user ${userId}`);
      return;
    }

    const messages: ExpoPushMessage[] = tokens.map((t) => ({
      to: t.token,
      sound: "default",
      title,
      body,
      data,
      priority: "high",
    }));

    const tickets = await this.sendPushNotifications(messages);

    // Handle failed tokens (deactivate them)
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      if (
        ticket.status === "error" &&
        ticket.details?.error === "DeviceNotRegistered"
      ) {
        // Deactivate this token
        const token = tokens[i];
        if (token) {
          token.isActive = false;
          await token.save();
          console.log(`Deactivated push token ${token.id} - device not registered`);
        }
      }
    }
  }

  /**
   * Notify an athlete that their profile was viewed
   */
  static async notifyProfileView(
    athleteId: string,
    viewerRole: string
  ): Promise<void> {
    const athlete = await Athlete.findOne({
      where: { id: athleteId },
      relations: ["user"],
    });

    if (!athlete) {
      return;
    }

    await this.sendToUser(
      athlete.userId,
      "Profile Viewed!",
      `A ${viewerRole} just viewed your profile`,
      { type: "profile_view", athleteId }
    );
  }

  /**
   * Notify an athlete of coach interest
   */
  static async notifyCoachInterest(
    athleteId: string,
    coachName: string,
    school: string
  ): Promise<void> {
    const athlete = await Athlete.findOne({
      where: { id: athleteId },
      relations: ["user"],
    });

    if (!athlete) {
      return;
    }

    await this.sendToUser(
      athlete.userId,
      "A Coach Is Interested!",
      `${coachName} from ${school} wants to connect with you`,
      { type: "coach_interest", athleteId, coachName, school }
    );
  }

  /**
   * Notify an athlete of a new message
   */
  static async notifyNewMessage(
    athleteId: string,
    senderName: string
  ): Promise<void> {
    const athlete = await Athlete.findOne({
      where: { id: athleteId },
      relations: ["user"],
    });

    if (!athlete) {
      return;
    }

    await this.sendToUser(
      athlete.userId,
      "New Message",
      `You have a new message from ${senderName}`,
      { type: "message", athleteId }
    );
  }

  /**
   * Notify an athlete of rating update
   */
  static async notifyRatingUpdate(
    athleteId: string,
    oldRating: number,
    newRating: number
  ): Promise<void> {
    const athlete = await Athlete.findOne({
      where: { id: athleteId },
      relations: ["user"],
    });

    if (!athlete) {
      return;
    }

    const direction = newRating > oldRating ? "increased" : "decreased";

    await this.sendToUser(
      athlete.userId,
      "Rating Updated",
      `Your star rating has ${direction} to ${newRating.toFixed(1)} stars`,
      { type: "rating_update", athleteId, oldRating, newRating }
    );
  }
}

export const notificationService = new NotificationService();
