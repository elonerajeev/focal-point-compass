import { prisma } from "../config/prisma";

type ConversationRecord = {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  team: string;
};

type MessageRecord = {
  id: number;
  chatId: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
};

function mapConversation(conversation: {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  team: string;
}): ConversationRecord {
  return {
    id: conversation.id,
    name: conversation.name,
    avatar: conversation.avatar,
    lastMessage: conversation.lastMessage,
    time: conversation.time,
    unread: conversation.unread,
    online: conversation.online,
    team: conversation.team,
  };
}

function mapMessage(message: {
  id: number;
  conversationId: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
}): MessageRecord {
  return {
    id: message.id,
    chatId: message.conversationId,
    sender: message.sender,
    text: message.text,
    time: message.time,
    isMe: message.isMe,
  };
}

export const communicationService = {
  async listConversations() {
    const conversations = await prisma.conversation.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
    });

    return conversations.map(mapConversation);
  },

  async listMessages() {
    const messages = await prisma.message.findMany({
      where: { deletedAt: null },
      orderBy: [{ conversationId: "asc" }, { createdAt: "asc" }],
    });

    return messages.map(mapMessage);
  },
};
