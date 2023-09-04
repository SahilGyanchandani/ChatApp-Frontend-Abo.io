export interface Message {
  messageId: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: any;
}

export interface MessageSend {
  content: string;
  receiverId: string;
}