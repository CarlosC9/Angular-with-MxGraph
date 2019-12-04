import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPServer } from '../ip.constans';

@Injectable({
  providedIn: 'root'
})
export class DiagramsService {

  constructor(private http : HttpClient) { }

  getUserDiagram() {
    return this.http.get("http://" + IPServer.VALUE + ":3000/diagrams", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    });
  }
}
