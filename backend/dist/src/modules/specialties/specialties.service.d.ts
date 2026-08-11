import { PrismaService } from '../../database/prisma.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
export declare class SpecialtiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateSpecialtyDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        iconUrl: string | null;
        createdAt: Date;
    }>;
    findAll(): Promise<({
        _count: {
            doctors: number;
        };
    } & {
        id: string;
        name: string;
        slug: string;
        description: string | null;
        iconUrl: string | null;
        createdAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        iconUrl: string | null;
        createdAt: Date;
    }>;
}
