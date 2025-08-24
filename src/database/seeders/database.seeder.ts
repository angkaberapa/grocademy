import { Injectable } from '@nestjs/common';
import { UserSeeder } from './user.seeder';
import { CourseSeeder } from './course.seeder';
import { ModuleSeeder } from './module.seeder';

@Injectable()
export class DatabaseSeeder {
  constructor(
    private readonly userSeeder: UserSeeder,
    private readonly courseSeeder: CourseSeeder,
    private readonly moduleSeeder: ModuleSeeder,
  ) {}

  async seed(): Promise<void> {
    console.log('🚀 Starting database seeding...');
    
    try {
      // Seed in order: users first, then courses, then modules
      await this.userSeeder.seed();
      await this.courseSeeder.seed();
      await this.moduleSeeder.seed();
      
      console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }
}
