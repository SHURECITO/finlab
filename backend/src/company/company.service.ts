import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

const VALID_SECTORS = new Set([
  'tech_saas', 'retail', 'manufactura', 'servicios', 'construccion',
  'agro', 'salud', 'educacion', 'alimentos', 'transporte', 'turismo', 'energia', 'otros',
]);

@Injectable()
export class CompanyService {
  constructor(
    @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
  ) {}

  async create(dto: CreateCompanyDto, userId: string): Promise<CompanyDocument> {
    const company = new this.companyModel({
      ...dto,
      userId: new Types.ObjectId(userId),
    });
    return company.save();
  }

  async findByUser(userId: string): Promise<CompanyDocument[]> {
    return this.companyModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string, userId: string): Promise<CompanyDocument> {
    if (!isValidObjectId(id)) throw new NotFoundException('Company not found');
    const company = await this.companyModel.findById(id).exec();
    if (!company) throw new NotFoundException('Company not found');
    if (company.userId.toString() !== userId) throw new ForbiddenException('Access denied');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto, userId: string): Promise<CompanyDocument> {
    const company = await this.findOne(id, userId);
    company.set(dto);
    return company.save();
  }

  async findByUserId(userId: string): Promise<CompanyDocument | null> {
    return this.companyModel.findOne({ userId: new Types.ObjectId(userId) }).sort({ createdAt: 1 }).exec();
  }

  async setFinancialProfile(
    userId: string,
    data: { activos: number; ingresosMensuales: number; gastosMensuales: number; sectorEconomico: string },
  ): Promise<CompanyDocument> {
    if (!VALID_SECTORS.has(data.sectorEconomico)) {
      throw new BadRequestException(`Sector no reconocido: ${data.sectorEconomico}`);
    }
    const update = {
      ...data,
      hasFinancialProfile: true,
      financialProfileUpdatedAt: new Date(),
    };

    const company = await this.companyModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      {
        $set: update,
        $setOnInsert: {
          name: 'Mi empresa',
          description: 'Perfil creado desde el comparador',
          sector: data.sectorEconomico,
          city: 'Colombia',
          stage: 'idea',
          foundedYear: new Date().getFullYear(),
        },
      },
      { upsert: true, new: true },
    );
    return company!;
  }

  async clearFinancialProfile(userId: string): Promise<void> {
    const company = await this.findByUserId(userId);
    if (!company) return;
    company.set({
      activos: undefined,
      ingresosMensuales: undefined,
      gastosMensuales: undefined,
      sectorEconomico: undefined,
      hasFinancialProfile: false,
      financialProfileUpdatedAt: new Date(),
    });
    await company.save();
  }

  async findPublic(): Promise<unknown[]> {
    // Aggregation: public companies + their latest simulation
    return this.companyModel.aggregate([
      { $match: { isPublic: true } },
      {
        $lookup: {
          from: 'simulations',
          let: { companyId: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$companyId', '$$companyId'] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $project: {
                _id: 1,
                'result.projectedIRR': 1,
                'result.paybackPeriod': 1,
                'result.status': 1,
                'result.statusColor': 1,
                createdAt: 1,
              },
            },
          ],
          as: 'simulations',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          sector: 1,
          city: 1,
          stage: 1,
          foundedYear: 1,
          latestSimulation: { $arrayElemAt: ['$simulations', 0] },
        },
      },
      { $sort: { _id: -1 } },
    ]).exec();
  }
}
