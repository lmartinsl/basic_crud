import { combineLatest, Subject } from 'rxjs';
import { Department } from './../../interfaces/department';
import { DepartmentService } from './../../services/department/department.service';
import { Product } from './../../interfaces/product';
import { ProductService } from './../../services/product/product.service';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {

  @ViewChild('form') public form: NgForm;

  public productForm: FormGroup;
  public products: Product[] = [];
  public departments: Department[] = [];

  private unsubscribe$: Subject<any> = new Subject();

  constructor(
    private prodService: ProductService,
    private depService: DepartmentService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {

    this.createForm();

    combineLatest([
      this.prodService.getProducts(),
      this.depService.getDepartments()
    ])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([prods, deps]) => {
        this.products = prods;
        this.departments = deps
      })
  }

  private createForm(): void {
    const { required, min } = Validators

    this.productForm = this.fb.group({
      _id: [null],
      name: ['', [required]],
      stock: [0, [required, min(0)]],
      price: [0, [required, min(0)]],
      departments: [[], [required]]
    })
  }

  public save(): void {
    let data = this.productForm.value
    if (data._id !== null) {
      this.prodService.updateProduct(data)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe();
    } else {
      this.prodService.addProduct(data)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe();
    }

    this.resetForm()
  }

  public edit(prod: Product): void {
    this.productForm.setValue(prod)
  }

  public delete(prod: Product): void {
    this.prodService.deleteProduct(prod)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        () => this.notify('Deleted!'),
        (err) => this.notify(err.error.msg)
      )
  }

  public notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 1000 })
  }

  public resetForm(): void {
    // this.productForm.reset(); Bug do material
    this.form.resetForm();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

}
