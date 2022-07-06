import { DepartmentService } from './../../services/department/department.service';
import { Department } from './../../interfaces/department';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit, OnDestroy {

  public depName: string = '';
  public departments: Department[] = [];
  public depEdit: Department = null;
  private subscription$: Subject<any> = new Subject<any>();

  constructor(
    private depService: DepartmentService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.depService.getDepartments()
      .pipe(takeUntil(this.subscription$))
      .subscribe((deps: Department[]) => {
        this.departments = deps
      })
  }

  public save(): void {
    if (!this.depName) return
    if (this.depEdit) {
      this.depService.editDepartment({ _id: this.depEdit._id, name: this.depName })
        .subscribe(
          () => {
            this.notify('Updated!')
          },
          () => this.notify('Error!')
        )
    } else {
      this.depService.addDepartment({ name: this.depName })
        .subscribe(
          () => {
            this.notify('Inserted!')
          },
          () => this.notify('Error!')
        )
    }
    this.clearFields()
  }

  public cancel(): void {
    this.clearFields()
  }

  public edit(d: Department): void {
    this.depName = d.name
    this.depEdit = d
  }

  public delete(d: Department): void {
    this.depService.deleteDepartment(d)
      .subscribe(
        () => this.notify(`"${d.name}" was Removed!`),
        (err) => this.notify(err.error.msg)
      )
  }

  public clearFields(): void {
    this.depName = ''
    this.depEdit = null
  }

  public notify(msg: string): void {
    this.snackBar.open(msg, 'Ok', {
      duration: 3000
    })
  }

  ngOnDestroy(): void {
    this.subscription$.next()
  }
}
