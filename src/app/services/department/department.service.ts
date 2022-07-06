import { Department } from './../../interfaces/department';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ObservedValueOf } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {

  private readonly url = 'http://localhost:9000/departments'
  public departmentSubject$: BehaviorSubject<Department[]> = new BehaviorSubject<Department[]>(null)
  private loaded: boolean = false

  constructor(private http: HttpClient) { }

  public getDepartments(): Observable<Department[]> {
    if (!this.loaded) {
      this.http.get<Department[]>(this.url)
        .pipe(
          tap((el) => console.log(el))
        )
        .subscribe(this.departmentSubject$)
      this.loaded = true
    }
    return this.departmentSubject$.asObservable()
  }

  public addDepartment(dep: Department): Observable<Department> {
    return this.http.post<Department>(this.url, dep)
      .pipe(tap((dep: Department) => {

        this.departmentSubject$.getValue().push(dep)
        console.log(this.departmentSubject$.getValue())
      }))
  }

  public deleteDepartment(dep: Department): Observable<any> {
    return this.http.delete(`${this.url}/${dep._id}`)
      .pipe(
        tap(() => {
          let deps = this.departmentSubject$.getValue()
          let i = deps.findIndex((d: Department) => d._id === dep._id)
          if (i >= 0) {
            deps.splice(i, 1)
          }
        })
      )
  }

  public editDepartment(dep: Department): Observable<Department> {
    return this.http.patch<Department>(`${this.url}/${dep._id}`, dep)
      .pipe(
        tap((dep: Department) => {
          let deps = this.departmentSubject$.getValue()
          let i = deps.findIndex((d: Department) => d._id === dep._id)
          if (i >= 0) {
            deps[i].name = dep.name
          }
        })
      )
  }

}
