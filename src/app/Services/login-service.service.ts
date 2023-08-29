import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MessageSend } from '../Models/message.model';

import { ApiLog } from '../Models/Apilog.model';



@Injectable({
  providedIn: 'root'
})

export class LoginServiceService {

  constructor(private http: HttpClient) { }

  logout(): Observable<any> {
    return this.http.get<any>(`https://localhost:44378/api/account/logout`);
  }

  searchConversation(query: string): Observable<any> {
    return this.http.get<any>(`https://localhost:44378/api/app/message/search-conversation?query=${query}`);
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
      { headers: headers });
  }

  onReg(userData: any): Observable<any> {
    return this.http.post<any>('https://localhost:44378/api/account/register', userData);
  }

  onUserList(): Observable<any> {
    return this.http.get<any>('https://localhost:44378/api/app/user/users');
  }

  onMsgHistory(userid: any): Observable<any> {
    return this.http.get<any>(`https://localhost:44378/api/app/message/conversation-history/${userid}?count=20&sort=asc`);
  }

  sendMessage(message: MessageSend): Observable<any> {
    return this.http.post<any>(`https://localhost:44378/api/app/message`, message);
  }

  updateMessage(id: string, content: string): Observable<any> {
    const url = `https://localhost:44378/api/app/message/message/${id}?Content=${encodeURIComponent(content)}`;
    return this.http.put(url, {});
    // const body = { content }; // Assuming your backend API expects the content in the request body
  }

  deleteMessage(id: string): Observable<any> {
    return this.http.delete<any>(`https://localhost:44378/api/app/message/message/${id}`);
  }

  // Fetches API logs from the server
  getApiLogs(): Observable<ApiLog[]> {
    return this.http.get<ApiLog[]>(`https://localhost:44378/api/app/api-logs/api-logs`);
  }


}

