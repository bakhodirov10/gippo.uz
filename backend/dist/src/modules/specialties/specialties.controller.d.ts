import { SpecialtiesService } from './specialties.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
export declare class SpecialtiesController {
    private readonly specialtiesService;
    constructor(specialtiesService: SpecialtiesService);
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
    create(dto: CreateSpecialtyDto): Promise<{
        id: string;
        name: string;
        slug: string;
        description: string | null;
        iconUrl: string | null;
        createdAt: Date;
    }>;
}
