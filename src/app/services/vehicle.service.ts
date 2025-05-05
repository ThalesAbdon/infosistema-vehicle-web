import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Vehicle {
  _id?: string;
  placa: string;
  chassi: string;
  renavam: string;
  modelo: string;
  marca: string;
  ano: number;
}

export interface VehicleListResponse {
  data: Vehicle[];
  page: number;
  limit: number;
  total: number;
  lastPage: number;
}

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private apiUrl = 'http://localhost:3000/vehicles';

  constructor(private http: HttpClient) {}

  addVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  getVehiclesWithParams(paramsObj: any): Observable<VehicleListResponse> {
    let params = new HttpParams();

    for (const key in paramsObj) {
      if (paramsObj[key] !== undefined && paramsObj[key] !== null) {
        params = params.set(key, paramsObj[key]);
      }
    }

    return this.http.get<VehicleListResponse>(this.apiUrl, { params });
  }

  updateVehicle(id: string, data: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, data);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
