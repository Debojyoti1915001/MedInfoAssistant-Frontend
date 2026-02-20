import { Injectable } from '@nestjs/common';
import { DataService } from './data.service';
import { User } from './types/user';

@Injectable()
export class AuthService {
  constructor(private readonly dataService: DataService) {}

  login(email: string, password: string): User | null {
    // Check patients first
    const patients = this.dataService.getPatients();
    const patientUser = patients.find(
      (patient) => patient.email === email && patient.password === password,
    );

    if (patientUser) {
      return {
        name: patientUser.name,
        email: patientUser.email,
        role: 'patient',
        patient_id: String(patientUser.id),
      };
    }

    // Check doctors
    const doctors = this.dataService.getDoctors();
    const doctorUser = doctors.find(
      (doctor) => doctor.email === email && doctor.password === password,
    );

    if (doctorUser) {
      return {
        name: doctorUser.name,
        email: doctorUser.email,
        role: 'doctor',
        doctor_id: String(doctorUser.id),
      };
    }

    return null;
  }
}
