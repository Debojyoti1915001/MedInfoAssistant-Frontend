import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  Body,
  Req,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Request, Response } from 'express';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { DataService } from './data.service';
import { Prescription } from './types/prescription';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

// Ensure uploads directory exists
try {
  mkdirSync(UPLOAD_DIR, { recursive: true });
} catch {
  // Directory already exists
}

@Controller('prescriptions')
export class PrescriptionsController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (req, file, callback) => {
          const filename = `${randomUUID()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
      fileFilter: (req, file, callback) => {
        const allowedMimes = [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'text/plain',
        ];
        const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf', '.txt'];
        const ext = file.originalname
          .toLowerCase()
          .substring(file.originalname.lastIndexOf('.'));

        if (!allowedMimes.includes(file.mimetype) || !allowedExts.includes(ext)) {
          callback(
            new BadRequestException(
              'Only jpg, png, pdf, and txt files are allowed',
            ),
            false,
          );
        } else {
          callback(null, true);
        }
      },
      limits: {
        fileSize: 30 * 1024 * 1024, // 30 MB
      },
    }),
  )
  async uploadPrescription(
    @UploadedFile() file: Express.Multer.File,
    @Body('symptoms') symptoms: string,
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!symptoms || symptoms.trim().length === 0) {
      throw new BadRequestException('Symptoms description is required');
    }

    const rawSession = request.cookies?.session;
    if (!rawSession) {
      throw new BadRequestException('User session not found');
    }

    const user = JSON.parse(rawSession);
    if (user.role !== 'patient' || !user.patient_id) {
      throw new BadRequestException('Invalid patient session');
    }

    const prescription: Prescription = {
      _presId: randomUUID(),
      doc: '1', // Hardcoded doctor id
      patientId: user.patient_id,
      symptoms: symptoms.trim(),
      createdDate: new Date(),
      file: {
        name: file.originalname,
        path: `/uploads/${file.filename}`,
        mimetype: file.mimetype,
        size: file.size,
      },
    };

    this.dataService.addPrescription(prescription);

    return {
      success: true,
      message: 'Prescription uploaded successfully',
      prescription,
    };
  }

  @Get(':patientId')
  getPrescriptions(@Param('patientId') patientId: string) {
    const prescriptions = this.dataService.getPrescriptionsByPatientId(patientId);
    return {
      success: true,
      data: prescriptions,
    };
  }

  @Get('file/:filename')
  downloadFile(
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const filepath = join(UPLOAD_DIR, filename);
    response.download(filepath);
  }
}
