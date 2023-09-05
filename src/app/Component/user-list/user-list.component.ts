import { Component, OnInit } from '@angular/core';
import { LoginServiceService } from 'src/app/Services/login-service.service';
import { Message, MessageSend } from 'src/app/Models/message.model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { Location } from '@angular/common';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})


export class UserListComponent implements OnInit {
  searchQuery: string = ''; // Holds the search query entered by the user
  searchResults: Message[] = []; // Holds the list of messages that match the search query
  Users: any;
  Msg: Message[] = []; // Initialize Msg as an empty array
  sendMsg: MessageSend[] = [];
  newMessage: string = ''; // Holds the message content from the textbox
  selectedUserId: string | null = null; // The receiver's userID
  editingMessageId: string | null = null; // The message ID being edited
  editedMessageContent = '';
  isEditingPlaceholderVisible = true; // Initially show the placeholder
  // Add properties for the context menu
  deletingMessageId: string | null = null;
  showContextMenu: boolean = false;
  contextMenuX: string = '0';
  contextMenuY: string = '0';
  private connection!: HubConnection;
  localToken: any = localStorage.getItem('token');


  constructor(private userService: LoginServiceService, private route: Router, private location: Location) {
    this.userService.onUserList().subscribe((data) => {
      this.Users = data;
      // console.log(this.Users);
    });

  }
  ngOnInit(): void {

    this.connection = new HubConnectionBuilder()

      .withUrl(`https://localhost:44378/chat`, { accessTokenFactory: () => this.localToken })
      .build();


    this.connection.start()
      .then(() =>
        console.log(' SignalR conn start'))
      .catch(err => {
        console.log('error in SignalR conn')
      });

    this.connection.on('Broadcast', (message) => {
      this.Msg.push(message);

      // Scroll to the bottom when user send or receive the mesaage
      this.scrollToBottom();

    })

    this.connection.on('editMsgSignalR', (editMessage) => {
      // Find and update the edited message in your array of messages (this.Msg).
      const index = this.Msg.findIndex(msg => msg.messageId === editMessage.messageId);
      if (index !== -1) {
        this.Msg[index] = editMessage;
      }
    });

    this.connection.on('DeleteMsgSignalR', (deletedMessageId) => {
      // Find and remove the deleted message from your array of messages (this.Msg).
      const index = this.Msg.findIndex(msg => msg.messageId === deletedMessageId.messageId);
      if (index !== -1) {
        this.Msg.splice(index, 1);
      }
    });
  }

  logout() {
    this.userService.logout().subscribe((data) => {
      //Clear the token from local storage
      localStorage.removeItem('token');
      //redirect to login page
      this.route.navigateByUrl('/login');
    })
  }

  onSearchInputChange(): void {
    if (this.searchQuery.trim() === '') {
      // If the search query is empty, clear the search results and show the normal conversation
      this.searchResults = [];
    } else {
      // If there's a search query, make an API call to get the search results
      this.userService.searchConversation(this.searchQuery).subscribe(
        (response: any) => {
          console.log(response);

          if (response) {
            this.searchResults = response;

          } else {
            // Handle unexpected response format
            console.error('Unexpected response format:', response);
            alert('Failed to search conversation due to unexpected response format.');
          }
        },
        (error: any) => {
          // Handle error, display relevant error message to the user
          console.error('Error searching conversation:', error);
          alert('Failed to search conversation. Please try again.');
        }
      );
    }
  }
  // Method to clear the search query and results
  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
  }

  getUserConversation(user: any): void {
    this.location.replaceState(`userlist/receiverId/${user.id}`)
    this.userService.onMsgHistory(user.id).subscribe((data: any) => {
      // console.log('Data from API:', data);

      this.Msg = data; // Assign the array of messages to Msg
      this.selectedUserId = user.id; // Set the selectedUserId to the receiver's userId
      // console.log('Msg array:', this.Msg);

      // Scroll to the bottom of the conversation
      this.scrollToBottom();

    });
  }


  getUserById(userId: string): any {
    return this.Users.find((user: any) => user.id === userId);
  }

  sendMessage(): void {
    if (this.newMessage.trim() === '' || !this.selectedUserId) {
      // Do not send an empty message or if there's no selected user
      return;
    }

    // Construct the message object to be sent to the backend
    const newMsg: MessageSend = {
      content: this.newMessage.trim(),
      receiverId: this.selectedUserId,
      // Use selectedUserId as the recipient's receiverID
    };

    // Make a POST request to send the message
    this.userService.sendMessage(newMsg).subscribe(
      (response: Message) => {
        this.newMessage = '';
        this.connection.invoke('SendMessage', response)
        // .then(() => {
        //   // console.log('Message sent successfully');
        // })
        this.Msg.push(response);
        // console.log(response);

        // console.log(newMsg);

        // Scroll to the bottom of the conversation after the new message is added
        this.scrollToBottom();
      },

      (error: any) => {
        // Handle error, display relevant error message to the user
        console.error('Error sending message:', error);
        alert('Failed to send message. Please try again.');
      }
    );
  }


  onMessageInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.newMessage = target.value;
  }

  editMessage(id: string): void {
    this.editingMessageId = id;
  }

  acceptEdit(id: string, editedContent: string): void {
    // Find the message with the given messageId
    const messageToUpdate = this.Msg.find((message) => message.messageId === id);

    if (!messageToUpdate) {
      console.error('Message not found for editing.');
      return;
    }
    else {
      alert('Message Edited SuccessFully');
    }

    // Make a PUT request to update the message content
    this.userService.updateMessage(id, editedContent).subscribe(
      (response: any) => {
        this.connection.invoke('EditMessage', response)
        // .then(() => {
        //   console.log('Message Edit successfully');
        // })

        // On successful response, update the message in the conversation history
        messageToUpdate.content = editedContent;
        this.editedMessageContent = ''; // Clear the textarea content
        this.isEditingPlaceholderVisible = true; // Show the placeholder again

        // Clear the editingMessageId after accepting the edit
        this.editingMessageId = null;
      },
      (error: any) => {
        // Handle error, display relevant error message to the user
        console.error('Error updating message:', error);
        alert('Failed to update message. Please try again.');
      }
    );
  }

  declineEdit(): void {
    // Clear the editingMessageId when declining the edit
    this.editingMessageId = null;
  }

  isMessageBeingEdited(messageId: string): boolean {
    return this.editingMessageId === messageId;
  }

  onMessageContextMenu(event: MouseEvent, message: Message): void {
    event.preventDefault(); // Prevent the default context menu from showing up
    // Show the context menu with options to edit and delete
    this.showContextMenu = true;
    this.contextMenuX = event.pageX + 'px';
    this.contextMenuY = event.pageY + 'px';
    // Set the deletingMessageId to the current message id
    this.deletingMessageId = message.messageId;
  }


  // Method to handle delete action
  onMessageDelete(message: Message): void {
    // Close the context menu
    this.hideContextMenu();

    // Show a confirmation dialog to the user
    const isConfirmed = confirm('Are you sure you want to delete this message?');
    if (isConfirmed) {
      // Make a DELETE request to delete the message
      this.userService.deleteMessage(message.messageId).subscribe(
        (response) => {
          this.newMessage = '';
          this.connection.invoke('DeleteMessage', message)

          // .then(() => {
          //   // console.log('Message Deleted successfully');
          // })

          if (response) {
            // On successful response, remove the deleted message from the conversation
            this.removeMessage(message.messageId);
          }

        },
        (error: any) => {
          // Handle error, display relevant error message to the user
          console.error('Error deleting message:', error);
          alert('Failed to delete message. Please try again.');
        }
      );
    }
  }

  // Method to remove a message from the conversation history
  private removeMessage(messageId: string): void {
    const messageIndex = this.Msg.findIndex((msg) => msg.messageId === messageId);
    if (messageIndex !== -1) {
      this.Msg.splice(messageIndex, 1);
    }
  }

  // Method to hide the context menu
  hideContextMenu(): void {
    this.showContextMenu = false;
    this.deletingMessageId = null;
  }

  private scrollToBottom(Msg: Message[] = []): void {
    setTimeout(() => {
      const messageContainer = document.querySelector('.message-container');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    });
  }
}