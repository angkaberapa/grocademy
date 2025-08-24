import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../users/users.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Seeding users...');

    // Check if users already exist
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 1) {
      console.log('Users already exist, skipping user seeding');
      return;
    }

    const users: Partial<User>[] = [];

    // Create regular users
    const firstNames = [
      'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'Robert', 'Lisa',
      'William', 'Jennifer', 'James', 'Linda', 'Christopher', 'Patricia', 'Daniel',
      'Barbara', 'Matthew', 'Elizabeth', 'Anthony', 'Helen', 'Mark', 'Sandra',
      'Donald', 'Donna', 'Steven', 'Carol', 'Paul', 'Ruth', 'Andrew', 'Sharon'
    ];

    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
      'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
      'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
      'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
    ];

    for (let i = 1; i <= 30; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i}`;
      const email = `${username}@example.com`;
      const balance = Math.floor(Math.random() * 5000) + 1000; // Random balance between 1000-6000

      users.push({
        username,
        email,
        password: await bcrypt.hash('password123', 10),
        first_name: firstName,
        last_name: lastName,
        balance,
        role: UserRole.USER,
      });
    }

    await this.userRepository.save(users);
    console.log(`✅ Created ${users.length} users`);
  }
}
