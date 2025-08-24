import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../../module/module.entity';
import { Course } from '../../course/course.entity';

@Injectable()
export class ModuleSeeder {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Seeding modules...');

    // Check if modules already exist
    const existingModules = await this.moduleRepository.count();
    if (existingModules > 0) {
      console.log('Modules already exist, skipping module seeding');
      return;
    }

    // Get all courses
    const courses = await this.courseRepository.find();
    
    const moduleTitles = [
      'Introduction and Getting Started',
      'Setting Up Development Environment',
      'Core Concepts and Fundamentals',
      'Working with Variables and Data Types',
      'Control Flow and Logic',
      'Functions and Methods',
      'Object-Oriented Programming',
      'Error Handling and Debugging',
      'Working with APIs',
      'Database Integration',
      'Authentication and Security',
      'Testing and Quality Assurance',
      'Performance Optimization',
      'Deployment and Production',
      'Best Practices and Patterns',
      'Advanced Techniques',
      'Real-World Projects',
      'Code Review and Refactoring',
      'Monitoring and Maintenance',
      'Future Trends and Updates'
    ];

    const moduleDescriptions = [
      'Welcome to the course! In this module, we\'ll cover what you\'ll learn and how to get the most out of this course.',
      'Set up your development environment with all the necessary tools and software required for this course.',
      'Learn the fundamental concepts that form the foundation of everything we\'ll cover in this course.',
      'Understand how to work with different data types, variables, and basic data manipulation techniques.',
      'Master conditional statements, loops, and decision-making logic in your code.',
      'Deep dive into functions, methods, parameters, and return values for better code organization.',
      'Explore object-oriented programming concepts including classes, inheritance, and polymorphism.',
      'Learn how to handle errors gracefully and debug your code effectively using modern tools.',
      'Understand how to integrate with external APIs and handle HTTP requests and responses.',
      'Learn database design, queries, and how to integrate databases into your applications.',
      'Implement secure authentication systems and understand security best practices.',
      'Write comprehensive tests and ensure your code quality meets industry standards.',
      'Optimize your applications for better performance and scalability.',
      'Deploy your applications to production environments and manage releases.',
      'Learn industry best practices and common design patterns used by professionals.',
      'Explore advanced techniques and concepts that separate beginners from experts.',
      'Build real-world projects that demonstrate your skills and knowledge.',
      'Learn how to review code effectively and refactor existing codebases.',
      'Implement monitoring, logging, and maintenance strategies for production applications.',
      'Stay up-to-date with the latest trends and future developments in the field.'
    ];

    const modules: Partial<Module>[] = [];
    let moduleCounter = 1;

    for (const course of courses) {
      // Random number of modules per course (1-20)
      const numModules = Math.floor(Math.random() * 20) + 1;
      
      for (let i = 0; i < numModules; i++) {
        const titleIndex = i < moduleTitles.length ? i : Math.floor(Math.random() * moduleTitles.length);
        const descIndex = i < moduleDescriptions.length ? i : Math.floor(Math.random() * moduleDescriptions.length);
        
        // Randomly decide if module has video, PDF, or both
        let hasVideo = Math.random() > 0.3; // 70% chance
        let hasPdf = Math.random() > 0.4;   // 60% chance
        
        // Ensure at least one content type
        if (!hasVideo && !hasPdf) {
          if (Math.random() > 0.5) {
            hasVideo = true;
          } else {
            hasPdf = true;
          }
        }

        modules.push({
          course_id: course.id,
          title: `${i + 1}. ${moduleTitles[titleIndex]}`,
          description: moduleDescriptions[descIndex],
          order: i + 1,
          video_content: hasVideo ? 'https://pub-8a6e1a65654a4cfc88a11cb73b88039a.r2.dev/modules/videos/8820216-uhd_3840_2160_25fps.mp4' : undefined,
          pdf_content: hasPdf ? 'https://pub-8a6e1a65654a4cfc88a11cb73b88039a.r2.dev/modules/pdfs/Kalender_Pendidikan_2025_2026_No_496.pdf' : undefined,
        });
        
        moduleCounter++;
      }
    }

    await this.moduleRepository.save(modules);
    console.log(`✅ Created ${modules.length} modules across ${courses.length} courses`);
  }
}
