export type Role = "CLIENT" | "AI" | "OPERATOR" | "SYSTEM";
export type Type =
  | "SMS"
  | "EMAIL"
  | "PHONE"
  | "DEMO"
  | "MEETING"
  | "ACTIVITY"
  | "QUOTE";

export interface ChatBubbleProps {
  msg: {
    id: string;
    body: string;
    subject?: string;
    description?: string;
    activityType?: string;
    role: Role;
    type: Type;
    createdAt: Date | string;
    metadata?: any;
    mediaAttachments?: {
      id: string;
      filename: string;
      mimeType: string;
      mediaUrl: string;
      mediaSource: string;
      size: number;
    }[];
  };

  huelineId?: string;
  prospectName?: string;
  prospectId?: string;
  isPending?: boolean;
  isGroupStart?: boolean;
  isGroupEnd?: boolean;
  onCancelFollowUp?: (id: string) => Promise<void>
}
