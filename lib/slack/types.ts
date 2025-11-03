// lib/slack/types.ts
export interface SlackInteraction {
  type: string;
  actions: Array<{
    action_id: string;
    value: string;
  }>;
  user: {
    id: string;
    username?: string;
  };
  response_url: string;
}