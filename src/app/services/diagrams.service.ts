import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IPServer } from '../ip.constans';

@Injectable({
  providedIn: 'root'
})
export class DiagramsService {

  constructor(private http: HttpClient) { }

  getUserDiagramOwner() {
    return this.http.get("http://" + IPServer.VALUE + ":3000/diagrams/my-diagrams", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    });
  }

  getUserDiagramsCollaboration() {
    return this.http.get("http://" + IPServer.VALUE + ":3000/diagrams/my-collaborations", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    });
  }

  newDiagram(name: string) {
    return this.http.post("http://" + IPServer.VALUE + ":3000/diagrams",
      {
        name: name,
      }
      , {
        headers: {
          Authorization: "Bearer " + localStorage.getItem('access_token')
        }
      });
  }

  getDiagram(id: string) {
    return this.http.get("http://" + IPServer.VALUE + ":3000/diagrams/" + id, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    })
  }

  updateDiagram(id: string, diagram) {
    return this.http.put("http://" + IPServer.VALUE + ":3000/diagrams/" + id,
      {
        diagram: diagram
      },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem('access_token')
        }
      }
    )
  }

  deleteDiagram(id: string) {
    return this.http.delete("http://" + IPServer.VALUE + ":3000/diagrams/" + id,
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    });
  }

  addCollaborator(id: string, nameCollaborator) {
    return this.http.put("http://localhost:3000/diagrams/" + id +"/add-collaboration",
    {
      username: nameCollaborator,
    },
    {
      headers: {
        Authorization: "Bearer " + localStorage.getItem('access_token')
      }
    });
  }

}
