import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/users.entity';
import { Course } from '../course/course.entity';
import { CourseTopic } from '../course/course-topic.entity';
import { Module as LessonModule } from '../module/module.entity';
import { UserCourse } from '../user-courses/user-courses.entity';
import { UserModuleProgress } from '../user-module-progress/user-module-progress.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
    @InjectRepository(LessonModule)
    private moduleRepository: Repository<LessonModule>,
    @InjectRepository(UserCourse)
    private userCourseRepository: Repository<UserCourse>,
    @InjectRepository(UserModuleProgress)
    private userModuleProgressRepository: Repository<UserModuleProgress>,
  ) {}

  async run() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (optional - comment out for production)
    await this.clearDatabase();

    // Seed users
    const users = await this.seedUsers();
    console.log('👥 Users seeded successfully');

    // Seed courses
    const courses = await this.seedCourses();
    console.log('📚 Courses seeded successfully');

    // Seed course topics
    await this.seedCourseTopics(courses);
    console.log('🏷️ Course topics seeded successfully');

    // Seed modules
    await this.seedModules(courses);
    console.log('📖 Modules seeded successfully');

    // Seed some user enrollments (optional)
    await this.seedUserEnrollments(users, courses);
    console.log('🎓 User enrollments seeded successfully');

    console.log('🎉 Database seeding completed successfully!');
  }

  private async clearDatabase() {
    console.log('🧹 Clearing existing data...');
    await this.userModuleProgressRepository.delete({});
    await this.userCourseRepository.delete({});
    await this.moduleRepository.delete({});
    await this.courseTopicRepository.delete({});
    await this.courseRepository.delete({});
    await this.userRepository.delete({});
  }

  private async seedUsers() {
    const password = await bcrypt.hash('password123', 10);
    
    const users = [
      {
        username: 'gro',
        email: 'gro@grocademy.com',
        password,
        first_name: 'Gro',
        last_name: 'The Founder',
        balance: 10000,
        role: UserRole.ADMIN,
      },
      {
        username: 'luiy',
        email: 'luiy@grocademy.com',
        password,
        first_name: 'Luiy',
        last_name: 'The Wise',
        balance: 5000,
        role: UserRole.USER,
      },
      {
        username: 'kebin',
        email: 'kebin@nimons.com',
        password,
        first_name: 'Kebin',
        last_name: 'Banana Lover',
        balance: 1000,
        role: UserRole.USER,
      },
      {
        username: 'stewart',
        email: 'stewart@nimons.com',
        password,
        first_name: 'Stewart',
        last_name: 'The Guitarist',
        balance: 800,
        role: UserRole.USER,
      },
      {
        username: 'pop',
        email: 'pop@nimons.com',
        password,
        first_name: 'Pop',
        last_name: 'Unicorn Friend',
        balance: 600,
        role: UserRole.USER,
      },
      {
        username: 'toto',
        email: 'toto@nimons.com',
        password,
        first_name: 'Toto',
        last_name: 'Gelato Master',
        balance: 400,
        role: UserRole.USER,
      },
      {
        username: 'neroifa',
        email: 'dr.neroifa@chatroifa.ai',
        password,
        first_name: 'Dr. Neroifa',
        last_name: 'AI Creator',
        balance: 50000,
        role: UserRole.USER,
      },
    ];

    const savedUsers: User[] = [];
    for (const userData of users) {
      const user = this.userRepository.create(userData);
      savedUsers.push(await this.userRepository.save(user));
    }

    return savedUsers;
  }

  private async seedCourses() {
    const courses = [
      {
        title: 'Banana Economics: From Garden to Market',
        description: 'Learn the complete economics of banana cultivation, trade, and market dynamics. Perfect for Kebin and anyone who wants to understand the banana industry from an economic perspective.',
        instructor: 'Dr. Banana Smith',
        price: 49.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Guitar Mastery for Beginners',
        description: 'Master the art of guitar playing without disturbing your neighbors! Learn proper techniques, chord progressions, and how to play beautiful melodies that everyone will love.',
        instructor: 'Stewart The Great',
        price: 79.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Mythology and Fantastic Creatures',
        description: 'Explore the magical world of unicorns, dragons, and other mythical creatures. Learn about their origins, cultural significance, and how they inspire modern storytelling.',
        instructor: 'Prof. Unicorn Sparkles',
        price: 59.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Gelato Making Masterclass',
        description: 'Learn the art of creating perfect gelato! From classic flavors to innovative combinations, master the techniques used by Italian gelato masters.',
        instructor: 'Chef Toto Gelato',
        price: 89.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Introduction to AI and Machine Learning',
        description: 'Understand the fundamentals of artificial intelligence and machine learning. Learn how AI works and how it\'s changing the world, inspired by the revolutionary Chat-ROIFA.',
        instructor: 'Dr. Neroifa',
        price: 199.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Digital Platform Development',
        description: 'Learn how to build educational platforms like Grocademy! Cover web development, user experience design, and platform architecture.',
        instructor: 'Gro The Visionary',
        price: 149.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Investment Strategies for Creative Minds',
        description: 'Discover investment approaches that work for creative and unique individuals. Learn about brain investment, skill development, and building sustainable wealth.',
        instructor: 'Luiy The Wise',
        price: 99.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Chaos Management and Organization',
        description: 'Learn how to organize chaotic environments and turn randomness into productivity. Perfect for managing creative teams and unique personalities.',
        instructor: 'Gro The Organizer',
        price: 69.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Creative Problem Solving',
        description: 'Develop innovative approaches to solving complex problems. Learn from the Nimons\' unique perspective on finding creative solutions.',
        instructor: 'The Nimons Collective',
        price: 79.99,
        thumbnail_image: '/public/logo.png',
      },
      {
        title: 'Technology Trends and Future Predictions',
        description: 'Stay ahead of technological trends and learn to predict future innovations. Understand how AI, web platforms, and digital tools are shaping our future.',
        instructor: 'Dr. Future Vision',
        price: 129.99,
        thumbnail_image: '/public/logo.png',
      },
    ];

    const savedCourses: Course[] = [];
    for (const courseData of courses) {
      const course = this.courseRepository.create(courseData);
      savedCourses.push(await this.courseRepository.save(course));
    }

    return savedCourses;
  }

  private async seedCourseTopics(courses: Course[]) {
    const topicsData = [
      // Banana Economics
      { courseIndex: 0, topics: ['Economics', 'Agriculture', 'Market Analysis', 'Trade'] },
      // Guitar Mastery
      { courseIndex: 1, topics: ['Music', 'Guitar', 'Performance', 'Arts'] },
      // Mythology
      { courseIndex: 2, topics: ['Mythology', 'Fantasy', 'Culture', 'Storytelling'] },
      // Gelato Making
      { courseIndex: 3, topics: ['Cooking', 'Desserts', 'Italian Cuisine', 'Food Science'] },
      // AI and ML
      { courseIndex: 4, topics: ['AI', 'Machine Learning', 'Technology', 'Programming'] },
      // Platform Development
      { courseIndex: 5, topics: ['Web Development', 'Programming', 'Technology', 'Education'] },
      // Investment Strategies
      { courseIndex: 6, topics: ['Finance', 'Investment', 'Strategy', 'Personal Growth'] },
      // Chaos Management
      { courseIndex: 7, topics: ['Management', 'Organization', 'Leadership', 'Psychology'] },
      // Problem Solving
      { courseIndex: 8, topics: ['Critical Thinking', 'Innovation', 'Creativity', 'Strategy'] },
      // Technology Trends
      { courseIndex: 9, topics: ['Technology', 'Future', 'Innovation', 'Trends'] },
    ];

    for (const { courseIndex, topics } of topicsData) {
      const course = courses[courseIndex];
      for (const topicName of topics) {
        const topic = this.courseTopicRepository.create({
          course_id: course.id,
          topic: topicName,
        });
        await this.courseTopicRepository.save(topic);
      }
    }
  }

  private async seedModules(courses: Course[]) {
    const modulesData = [
      // Banana Economics modules
      {
        courseIndex: 0,
        modules: [
          {
            title: 'History of Banana Cultivation',
            description: 'Learn about the origins and evolution of banana cultivation worldwide.',
            order: 1,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/banana-history.pdf',
          },
          {
            title: 'Global Banana Trade Markets',
            description: 'Understanding international banana trade, major exporters and importers.',
            order: 2,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/banana-trade.pdf',
          },
          {
            title: 'Banana Price Analysis',
            description: 'Learn how to analyze banana prices and market fluctuations.',
            order: 3,
            pdf_content: '/uploads/modules/pdfs/banana-analysis.pdf',
          },
        ],
      },
      // Guitar Mastery modules
      {
        courseIndex: 1,
        modules: [
          {
            title: 'Guitar Basics and Setup',
            description: 'Learn about guitar parts, tuning, and proper setup.',
            order: 1,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/guitar-basics.pdf',
          },
          {
            title: 'Essential Chords for Beginners',
            description: 'Master the fundamental chords every guitarist should know.',
            order: 2,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
          {
            title: 'Strumming Patterns and Rhythm',
            description: 'Develop your sense of rhythm and learn various strumming techniques.',
            order: 3,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/strumming-patterns.pdf',
          },
          {
            title: 'Your First Song',
            description: 'Put it all together and learn to play your first complete song.',
            order: 4,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
      // Mythology modules
      {
        courseIndex: 2,
        modules: [
          {
            title: 'Introduction to Mythical Creatures',
            description: 'Overview of various mythical creatures across different cultures.',
            order: 1,
            pdf_content: '/uploads/modules/pdfs/mythical-intro.pdf',
          },
          {
            title: 'The Magic of Unicorns',
            description: 'Deep dive into unicorn mythology and cultural significance.',
            order: 2,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/unicorn-magic.pdf',
          },
          {
            title: 'Dragons Across Cultures',
            description: 'Explore how different cultures view and portray dragons.',
            order: 3,
            pdf_content: '/uploads/modules/pdfs/dragons-culture.pdf',
          },
        ],
      },
      // Gelato Making modules
      {
        courseIndex: 3,
        modules: [
          {
            title: 'Gelato vs Ice Cream: The Difference',
            description: 'Understanding what makes gelato special and different from ice cream.',
            order: 1,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/gelato-difference.pdf',
          },
          {
            title: 'Essential Equipment and Ingredients',
            description: 'Learn about the tools and ingredients needed for perfect gelato.',
            order: 2,
            pdf_content: '/uploads/modules/pdfs/gelato-equipment.pdf',
          },
          {
            title: 'Classic Vanilla Gelato Recipe',
            description: 'Master the fundamental vanilla gelato recipe.',
            order: 3,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/vanilla-gelato.pdf',
          },
          {
            title: 'Creative Flavor Combinations',
            description: 'Experiment with unique and delicious flavor combinations.',
            order: 4,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
      // AI and ML modules
      {
        courseIndex: 4,
        modules: [
          {
            title: 'What is Artificial Intelligence?',
            description: 'Introduction to AI concepts and applications.',
            order: 1,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/ai-intro.pdf',
          },
          {
            title: 'Machine Learning Fundamentals',
            description: 'Basic concepts of machine learning and how it works.',
            order: 2,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            pdf_content: '/uploads/modules/pdfs/ml-fundamentals.pdf',
          },
          {
            title: 'The Story of Chat-ROIFA',
            description: 'Learn about the revolutionary Chat-ROIFA and its impact.',
            order: 3,
            video_content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          },
        ],
      },
    ];

    for (const { courseIndex, modules } of modulesData) {
      const course = courses[courseIndex];
      for (const moduleData of modules) {
        const module = this.moduleRepository.create({
          ...moduleData,
          course_id: course.id,
        });
        await this.moduleRepository.save(module);
      }
    }
  }

  private async seedUserEnrollments(users: User[], courses: Course[]) {
    // Enroll some users in courses
    const enrollments = [
      { userIndex: 2, courseIndex: 0 }, // Kebin -> Banana Economics
      { userIndex: 3, courseIndex: 1 }, // Stewart -> Guitar Mastery
      { userIndex: 4, courseIndex: 2 }, // Pop -> Mythology
      { userIndex: 5, courseIndex: 3 }, // Toto -> Gelato Making
      { userIndex: 1, courseIndex: 6 }, // Luiy -> Investment Strategies
      { userIndex: 6, courseIndex: 4 }, // Neroifa -> AI and ML (their own course!)
    ];

    for (const { userIndex, courseIndex } of enrollments) {
      const user = users[userIndex];
      const course = courses[courseIndex];
      
      const userCourse = this.userCourseRepository.create({
        user_id: user.id,
        course_id: course.id,
      });
      await this.userCourseRepository.save(userCourse);
    }
  }
}
