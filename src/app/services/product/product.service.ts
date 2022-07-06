import { Department } from './../../interfaces/department';
import { DepartmentService } from './../department/department.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { Product } from './../../interfaces/product';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly url = 'http://localhost:9000/products'
  public productsSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>(null)
  private loaded: boolean = false

  constructor(
    private http: HttpClient,
    private depService: DepartmentService
  ) { }

  public getProducts(): Observable<Product[]> {
    if (!this.loaded) {
      combineLatest([
        this.http.get<Product[]>(this.url),
        this.depService.getDepartments()
      ])
        .pipe(
          tap(([products, departments]) => console.log(products, departments)),
          filter(([products, departments]) => products != null && departments != null),
          map(([products, departments]) => {
            for (let p of products) {
              let ids = (p.departments as string[]);
              if (ids) {
                p.departments = ids.map((id) => departments.find(dep => dep._id == id));
              }
            }
            return products;
          }),
          tap((products) => console.log(products))
        )
        .subscribe(this.productsSubject$);

      this.loaded = true;
    }
    return this.productsSubject$.asObservable();
  }

  public addProduct(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.post<Product>(this.url, { ...prod, departments })
      .pipe(
        tap((p) => {
          this.productsSubject$.getValue()
            .push({ ...prod, _id: p._id })
        })
      )
  }

  public deleteProduct(prod: Product): Observable<any> {
    return this.http.delete(`${this.url}/${prod._id}`)
      .pipe(
        tap(() => {
          let products = this.productsSubject$.getValue();
          let i = products.findIndex(p => p._id === prod._id);
          if (i >= 0)
            products.splice(i, 1);
        })
      )
  }

  public updateProduct(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.patch<Product>(`${this.url}/${prod._id}`, { ...prod, departments })
      .pipe(
        tap(() => {
          let products = this.productsSubject$.getValue();
          let i = products.findIndex(p => p._id === prod._id);
          if (i >= 0)
            products[i] = prod;
        })
      )
  }
}
