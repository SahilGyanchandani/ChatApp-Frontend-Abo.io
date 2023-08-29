export interface Message {
  messageId: string;
  content: string;
  senderId: string;
  receiverId: string;
  // id: string;
  timestamp: any;
}

export interface MessageSend {
  content: string;
  receiverId: string;
}

// export interface MessageDto {
//   MessageID: string;
//   Id: string; //SenderID Of User
//   ReceiverID: string; //ReceiverID of User
//   Content: string;
//   Timestamp: string;
// }