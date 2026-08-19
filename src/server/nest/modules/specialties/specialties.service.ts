import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSpecialtyDto) {
    const existing = await this.prisma.specialty.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug: dto.slug }],
      },
    });

    if (existing) {
      throw new ConflictException('Specialty with this name or slug already exists');
    }

    return this.prisma.specialty.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.specialty.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { doctors: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const specialty = await this.prisma.specialty.findUnique({
      where: { id },
    });

    if (!specialty) {
      throw new NotFoundException('Specialty not found');
    }

    return specialty;
  }
}
