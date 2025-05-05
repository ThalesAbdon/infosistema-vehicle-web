import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Vehicle, VehicleService } from '../../services/vehicle.service';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  isLoading = false;
  errorMessage: string | null = null;

  search = '';
  page = 1;
  limit = 5;
  lastPage = 1;

  vehicleToDelete: Vehicle | null = null;
  vehicleToEdit: Vehicle | null = null;
  vehicleToAdd: Vehicle | null = null; // Novo veículo para adicionar

  private searchSubject = new Subject<string>();

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadVehicles();

    this.searchSubject.pipe(debounceTime(400)).subscribe(() => {
      this.page = 1;
      this.loadVehicles();
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadVehicles();
    }
  }

  nextPage(): void {
    if (this.page < this.lastPage) {
      this.page++;
      this.loadVehicles();
    }
  }

  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = null;

    const queryParams = {
      page: this.page,
      limit: this.limit,
      search: this.search.trim() || undefined,
    };

    this.vehicleService.getVehiclesWithParams(queryParams).subscribe({
      next: (res) => {
        this.vehicles = res.data;
        this.lastPage = res.lastPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar veículos', err);
        this.errorMessage = 'Erro ao carregar veículos.';
        this.isLoading = false;
      },
    });
  }

  openAddModal(): void {
    const currentYear = new Date().getFullYear();
    this.vehicleToAdd = {
      placa: '',
      chassi: '',
      renavam: '',
      modelo: '',
      marca: '',
      ano: currentYear,
    };
  }

  cancelAdd(): void {
    this.vehicleToAdd = null;
  }

  addVehicle(): void {
    if (!this.vehicleToAdd) return;

    this.vehicleService.addVehicle(this.vehicleToAdd).subscribe({
      next: () => {
        this.loadVehicles(); // Recarrega a lista de veículos
        this.vehicleToAdd = null; // Fecha o modal
      },
      error: (err) => {
        console.error('Erro ao adicionar veículo', err);
        this.errorMessage = 'Erro ao adicionar veículo.';
      },
    });
  }

  // Confirmação para deletar
  confirmDelete(vehicle: Vehicle): void {
    this.vehicleToDelete = vehicle;
  }

  cancelDelete(): void {
    this.vehicleToDelete = null;
  }

  deleteVehicle(): void {
    if (!this.vehicleToDelete || !this.vehicleToDelete._id) {
      console.error('Erro: Veículo não tem ID!');
      return;
    }

    const vehicleId = this.vehicleToDelete._id;

    this.vehicleService.deleteVehicle(vehicleId).subscribe({
      next: () => {
        this.vehicleToDelete = null;
        this.loadVehicles();
      },
      error: (err) => {
        console.error('Erro ao deletar veículo', err);
        this.errorMessage = 'Erro ao deletar veículo.';
        this.vehicleToDelete = null;
      },
    });
  }

  openEditModal(vehicle: Vehicle): void {
    this.vehicleToEdit = { ...vehicle };
  }

  cancelEdit(): void {
    this.vehicleToEdit = null;
  }

  updateVehicle(): void {
    console.log('🧪 updateVehicle chamado');

    if (!this.vehicleToEdit) return;

    const edited: Vehicle = this.vehicleToEdit;
    const id = edited._id;

    if (!id) {
      this.errorMessage = 'ID do veículo não encontrado!';
      return;
    }

    const original = this.vehicles.find((v) => v._id === id);
    if (!original) {
      this.errorMessage = 'Veículo original não encontrado.';
      return;
    }

    const data: Partial<Vehicle> = {};

    for (const key of Object.keys(edited) as (keyof Vehicle)[]) {
      if (key === '_id') continue;

      let newValue = edited[key];
      const oldValue = original[key];

      // 📦 Forçar ano para number se for string
      if (key === 'ano' && typeof newValue === 'string') {
        newValue = parseInt(newValue, 10);
      }

      if (
        (typeof newValue === 'string' &&
          newValue.trim() !== String(oldValue).trim()) ||
        (typeof newValue === 'number' && newValue !== oldValue)
      ) {
        (data as any)[key] = newValue;
      }
    }

    const cleanData: Partial<Vehicle> = {};
    for (const key of Object.keys(data) as (keyof Vehicle)[]) {
      let value = data[key];

      if (typeof value === 'string') {
        value = value.trim();
        if (value === '') continue;

        if (key === 'placa') {
          value = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
        }
      }

      if (key === 'ano') {
        if (typeof value !== 'number' || isNaN(value)) continue;

        const currentYear = new Date().getFullYear();
        if (value < 1886 || value > currentYear + 1) continue;
      }

      (cleanData as any)[key] = value;
    }

    if (Object.keys(cleanData).length === 0) {
      console.log('⚠️ Nenhuma alteração detectada. Nada será enviado.');
      this.vehicleToEdit = null;
      return;
    }

    console.log('🚀 Atualizando com payload limpo:', cleanData);

    this.vehicleService.updateVehicle(id, cleanData).subscribe({
      next: () => {
        this.vehicleToEdit = null;
        this.loadVehicles();
      },
      error: (err) => {
        console.error('❌ Erro ao atualizar veículo:', err.error);
        this.errorMessage = Array.isArray(err.error?.message)
          ? err.error.message.join('\n')
          : err.error?.message || 'Erro ao atualizar veículo.';
      },
    });
  }
}
