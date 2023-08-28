export interface Message {
  messageID: string;
  content: string;
  userId: string;
  receiverID: string;
  id: string;
  timestamp: any;
}

export interface MessageSend {
  content: string;
  receiverID: string;
}

// export interface MessageDto {
//   MessageID: string;
//   Id: string; //SenderID Of User
//   ReceiverID: string; //ReceiverID of User
//   Content: string;
//   Timestamp: string;
// }