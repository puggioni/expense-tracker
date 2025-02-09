import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryType } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
    user: User,
  ): Promise<Category> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        user: { id: userId },
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: {
        id,
        user: { id: userId },
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findByType(type: string, userId: string): Promise<Category[]> {
    return this.categoryRepository.find({
      where: {
        type: type as CategoryType,
        user: { id: userId },
        isActive: true,
      },
      order: { name: 'ASC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const category = await this.findOne(id, userId);
    category.isActive = false;
    await this.categoryRepository.save(category);
  }
}
