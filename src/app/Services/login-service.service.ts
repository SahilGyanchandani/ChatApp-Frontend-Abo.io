import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, MessageSend } from '../Models/message.model';
import { HubConnection } from '@aspnet/signalr';
import { ApiLog } from '../Models/Apilog.model';



@Injectable({
  providedIn: 'root'
})

export class LoginServiceService {

  constructor(private http: HttpClient) { }


  searchConversation(query: string): Observable<any> {
    return this.http.get<any>(`https://localhost:7277/api/Message/search?query=${query}`);
  }

  onSubmit(obj: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>("https://localhost:44378/connect/token",
      "username=" + obj.userNameOrEmailAddress +
      "&password=" + obj.password +
      "&grant_type=password" +
      "&client_id=ChatApp_App&scope=openid offline_access ChatApp",
      { headers: headers })
  }

  onReg(userData: any): Observable<any> {
    return this.http.post<any>('https://localhost:44378/api/account/register', userData);
  }

  onUserList(): Observable<any> {
    return this.http.get<any>('https://localhost:44378/api/app/user/users');
  }

  onMsgHistory(userid: any): Observable<any> {
    return this.http.get<any>(`https://localhost:7277/api/Message?userId=${userid}`);
  }

  sendMessage(message: MessageSend): Observable<any> {
    return this.http.post<any>(`https://localhost:7277/api/Message`, message);
  }

  updateMessage(id: string, content: string): Observable<Message> {
    const url = `https://localhost:7277/api/Message/${id}`;
    const body = { content }; // Assuming your backend API expects the content in the request body
    return this.http.put<Message>(url, body);
  }

  deleteMessage(id: string): Observable<any> {
    return this.http.delete<any>(`https://localhost:7277/api/Message/${id}`);
  }

  // Fetches API logs from the server
  getApiLogs(): Observable<ApiLog[]> {
    return this.http.get<ApiLog[]>(`https://localhost:7277/api/ApiLogs`);
  }


}

