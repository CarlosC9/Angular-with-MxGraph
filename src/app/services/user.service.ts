import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPServer } from '../ip.constans';

@Injectable()
export class UserService {

  constructor(private http : HttpClient) { }

  login(user) {
    return this.http.post("http://" + IPServer.VALUE + ":3000/auth/login",user);
  }

  profile() {
    return this.http.get("http://" + IPServer.VALUE + ":3000/users/profile", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    });
  }
}
