import { Injectable } from '@nestjs/common';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Doctor } from './types/doctor';
import { Patient } from './types/patient';
import { Prescription } from './types/prescription';

type Database = {
  patients: Patient[];
  doctors: Doctor[];
  prescriptions: Prescription[];
};

@Injectable()
export class DataService {
  private readDb(): Database {
    const dbFilePath = join(process.cwd(), 'src', 'data', 'db.json');
    const fileContent = readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(fileContent) as Database;
  }

  private writeDb(data: Database): void {
    const dbFilePath = join(process.cwd(), 'src', 'data', 'db.json');
    writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  getPatients(): Patient[] {
    return this.readDb().patients;
  }

  getDoctors(): Doctor[] {
    return this.readDb().doctors;
  }

  getPrescriptions(): Prescription[] {
    return this.readDb().prescriptions;
  }

  getPrescriptionsByPatientId(patientId: string): Prescription[] {
    return this.getPrescriptions().filter(
      (prescription) => prescription.patientId === patientId,
    );
  }

  addPrescription(prescription: Prescription): Prescription {
    const db = this.readDb();
    db.prescriptions.push(prescription);
    this.writeDb(db);
    return prescription;
  }
}
