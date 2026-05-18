import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

export interface SafeUser {
  id: string;
  email: string;
  businessName: string;
  sector?: string;
  city?: string;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  private toSafeUser(user: UserDocument): SafeUser {
    return {
      id: (user._id as { toString(): string }).toString(),
      email: user.email,
      businessName: user.businessName,
      sector: user.sector,
      city: user.city,
      createdAt: user.createdAt,
    };
  }

  async register(
    dto: RegisterDto,
  ): Promise<{ access_token: string; user: SafeUser }> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email,
      password: hashedPassword,
      businessName: dto.businessName,
      sector: dto.sector,
      city: dto.city,
    });

    const payload = {
      sub: (user._id as { toString(): string }).toString(),
      email: user.email,
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: this.toSafeUser(user) };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: SafeUser }> {
    const user = await this.userModel.findOne({ email: dto.email }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: (user._id as { toString(): string }).toString(),
      email: user.email,
    };
    const access_token = this.jwtService.sign(payload);

    return { access_token, user: this.toSafeUser(user) };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toSafeUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<SafeUser> {
    const { businessName, sector, city } = dto;
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: { businessName, sector, city } },
        { new: true },
      )
      .exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toSafeUser(user);
  }
}
