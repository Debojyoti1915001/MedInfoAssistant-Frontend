export interface Prescription {
  _presId: string;
  doc: string;
  patientId: string;
  symptoms: string;
  createdDate: Date;
  file: {
    name: string;
    path: string;
    mimetype: string;
    size: number;
  };
}
