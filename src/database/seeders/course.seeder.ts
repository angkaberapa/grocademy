import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../../course/course.entity';
import { CourseTopic } from '../../course/course-topic.entity';

@Injectable()
export class CourseSeeder {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
  ) {}

  async seed(): Promise<void> {
    console.log('🌱 Seeding courses...');

    // Check if courses already exist
    const existingCourses = await this.courseRepository.count();
    if (existingCourses > 0) {
      console.log('Courses already exist, skipping course seeding');
      return;
    }

    const coursesData = [
      {
        title: 'Complete Web Development Bootcamp',
        description: 'Learn full-stack web development from scratch. This comprehensive course covers HTML, CSS, JavaScript, React, Node.js, and databases.',
        instructor: 'Dr. Angela Yu',
        price: 89.99,
        topics: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB']
      },
      {
        title: 'Python for Data Science and Machine Learning',
        description: 'Master Python programming for data analysis, visualization, and machine learning. Includes NumPy, Pandas, Matplotlib, and Scikit-learn.',
        instructor: 'Jose Portilla',
        price: 94.99,
        topics: ['Python', 'Data Science', 'Machine Learning', 'NumPy', 'Pandas', 'Matplotlib']
      },
      {
        title: 'Advanced React and Redux Development',
        description: 'Deep dive into React ecosystem with Redux, Context API, Hooks, and modern development patterns.',
        instructor: 'Stephen Grider',
        price: 79.99,
        topics: ['React', 'Redux', 'JavaScript', 'Hooks', 'Context API', 'Frontend']
      },
      {
        title: 'AWS Cloud Practitioner Certification',
        description: 'Complete guide to AWS cloud services and certification preparation. Learn EC2, S3, RDS, Lambda, and more.',
        instructor: 'Stephane Maarek',
        price: 69.99,
        topics: ['AWS', 'Cloud Computing', 'EC2', 'S3', 'Lambda', 'DevOps']
      },
      {
        title: 'Modern JavaScript ES6+ Fundamentals',
        description: 'Master modern JavaScript features including ES6+, async/await, promises, modules, and advanced concepts.',
        instructor: 'Brad Traversy',
        price: 54.99,
        topics: ['JavaScript', 'ES6', 'Async Programming', 'Modules', 'DOM', 'APIs']
      },
      {
        title: 'Docker and Kubernetes Masterclass',
        description: 'Learn containerization with Docker and orchestration with Kubernetes for modern application deployment.',
        instructor: 'Mumshad Mannambeth',
        price: 84.99,
        topics: ['Docker', 'Kubernetes', 'DevOps', 'Containers', 'Microservices', 'CI/CD']
      },
      {
        title: 'UI/UX Design Principles and Figma',
        description: 'Learn user interface and user experience design principles with hands-on Figma projects.',
        instructor: 'Daniel Schifano',
        price: 74.99,
        topics: ['UI/UX', 'Design', 'Figma', 'Prototyping', 'User Research', 'Wireframing']
      },
      {
        title: 'TypeScript Complete Developer Guide',
        description: 'Master TypeScript from basics to advanced concepts. Build type-safe applications with confidence.',
        instructor: 'Stephen Grider',
        price: 67.99,
        topics: ['TypeScript', 'JavaScript', 'Types', 'Interfaces', 'Generics', 'Decorators']
      },
      {
        title: 'GraphQL with React and Apollo',
        description: 'Build modern applications using GraphQL, Apollo Client, and React for efficient data fetching.',
        instructor: 'Reed Barger',
        price: 72.99,
        topics: ['GraphQL', 'React', 'Apollo', 'APIs', 'Frontend', 'Backend']
      },
      {
        title: 'Cybersecurity Fundamentals and Ethical Hacking',
        description: 'Learn cybersecurity principles, ethical hacking techniques, and how to secure web applications.',
        instructor: 'Zaid Sabih',
        price: 89.99,
        topics: ['Cybersecurity', 'Ethical Hacking', 'Network Security', 'Web Security', 'Penetration Testing']
      },
      {
        title: 'Data Structures and Algorithms in Java',
        description: 'Master fundamental computer science concepts with Java implementations and coding interview preparation.',
        instructor: 'Tim Ruscica',
        price: 76.99,
        topics: ['Java', 'Data Structures', 'Algorithms', 'Problem Solving', 'Coding Interviews']
      },
      {
        title: 'Flutter Mobile App Development',
        description: 'Build beautiful, native mobile apps for iOS and Android using Flutter and Dart programming language.',
        instructor: 'Angela Yu',
        price: 82.99,
        topics: ['Flutter', 'Dart', 'Mobile Development', 'iOS', 'Android', 'Cross Platform']
      },
      {
        title: 'PostgreSQL Database Administration',
        description: 'Complete guide to PostgreSQL database management, optimization, and advanced SQL queries.',
        instructor: 'Jose Portilla',
        price: 63.99,
        topics: ['PostgreSQL', 'Database', 'SQL', 'Database Design', 'Performance Tuning']
      },
      {
        title: 'Vue.js 3 Complete Course',
        description: 'Learn Vue.js 3 from scratch including Composition API, Vuex, Vue Router, and modern development.',
        instructor: 'Maximilian Schwarzmüller',
        price: 71.99,
        topics: ['Vue.js', 'JavaScript', 'Frontend', 'Composition API', 'Vuex', 'Vue Router']
      },
      {
        title: 'Blockchain Development with Solidity',
        description: 'Learn blockchain development, smart contracts, and decentralized applications using Solidity.',
        instructor: 'Ivan on Tech',
        price: 97.99,
        topics: ['Blockchain', 'Solidity', 'Smart Contracts', 'Ethereum', 'DApps', 'Web3']
      },
      {
        title: 'Digital Marketing and SEO Masterclass',
        description: 'Complete digital marketing course covering SEO, social media, email marketing, and analytics.',
        instructor: 'Phil Ebiner',
        price: 58.99,
        topics: ['Digital Marketing', 'SEO', 'Social Media', 'Email Marketing', 'Analytics', 'Content Marketing']
      },
      {
        title: 'Linux System Administration',
        description: 'Master Linux command line, system administration, and server management for DevOps professionals.',
        instructor: 'Jason Cannon',
        price: 69.99,
        topics: ['Linux', 'System Administration', 'Command Line', 'Shell Scripting', 'Server Management']
      },
      {
        title: 'iOS App Development with Swift',
        description: 'Build native iOS applications using Swift programming language and Xcode development environment.',
        instructor: 'Angela Yu',
        price: 85.99,
        topics: ['iOS', 'Swift', 'Xcode', 'Mobile Development', 'App Store', 'UIKit']
      },
      {
        title: 'Game Development with Unity',
        description: 'Create 2D and 3D games using Unity game engine and C# programming language.',
        instructor: 'Ben Tristem',
        price: 78.99,
        topics: ['Unity', 'Game Development', 'C#', '2D Games', '3D Games', 'Game Design']
      },
      {
        title: 'Express.js and Node.js Backend Development',
        description: 'Build robust backend APIs and web services using Express.js framework and Node.js runtime.',
        instructor: 'Brad Traversy',
        price: 66.99,
        topics: ['Node.js', 'Express.js', 'Backend', 'APIs', 'REST', 'Middleware']
      },
      {
        title: 'Artificial Intelligence and Deep Learning',
        description: 'Introduction to AI concepts, neural networks, and deep learning using TensorFlow and Keras.',
        instructor: 'Kirill Eremenko',
        price: 92.99,
        topics: ['AI', 'Deep Learning', 'Neural Networks', 'TensorFlow', 'Keras', 'Machine Learning']
      },
      {
        title: 'Angular Complete Guide',
        description: 'Master Angular framework for building dynamic single-page applications with TypeScript.',
        instructor: 'Maximilian Schwarzmüller',
        price: 73.99,
        topics: ['Angular', 'TypeScript', 'Frontend', 'SPA', 'Components', 'Services']
      },
      {
        title: 'Photography and Photo Editing Masterclass',
        description: 'Learn professional photography techniques and photo editing using Adobe Lightroom and Photoshop.',
        instructor: 'Phil Ebiner',
        price: 61.99,
        topics: ['Photography', 'Photo Editing', 'Lightroom', 'Photoshop', 'Composition', 'Lighting']
      },
      {
        title: 'MongoDB Database Development',
        description: 'Master NoSQL database development with MongoDB, aggregation framework, and data modeling.',
        instructor: 'Stephen Grider',
        price: 64.99,
        topics: ['MongoDB', 'NoSQL', 'Database', 'Aggregation', 'Data Modeling', 'Mongoose']
      },
      {
        title: 'Project Management and Agile Methodologies',
        description: 'Learn project management principles, Scrum, Kanban, and agile development methodologies.',
        instructor: 'Chris Croft',
        price: 55.99,
        topics: ['Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership', 'Team Management']
      },
      {
        title: 'Figma UI/UX Design Advanced Techniques',
        description: 'Advanced Figma techniques for professional UI/UX designers including prototyping and design systems.',
        instructor: 'Daniel Schifano',
        price: 69.99,
        topics: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping', 'Advanced Design', 'Collaboration']
      },
      {
        title: 'Git and GitHub Version Control',
        description: 'Master Git version control system and GitHub collaboration for professional software development.',
        instructor: 'Brad Traversy',
        price: 45.99,
        topics: ['Git', 'GitHub', 'Version Control', 'Branching', 'Merging', 'Collaboration']
      },
      {
        title: 'Sass and SCSS Advanced Styling',
        description: 'Level up your CSS skills with Sass/SCSS preprocessor for maintainable and scalable stylesheets.',
        instructor: 'Jonas Schmedtmann',
        price: 52.99,
        topics: ['Sass', 'SCSS', 'CSS', 'Preprocessor', 'Variables', 'Mixins']
      },
      {
        title: 'API Development and Testing',
        description: 'Build and test RESTful APIs with comprehensive coverage of HTTP methods, authentication, and documentation.',
        instructor: 'Jose Portilla',
        price: 68.99,
        topics: ['APIs', 'REST', 'HTTP', 'Testing', 'Postman', 'Documentation']
      },
      {
        title: 'Microsoft Excel Data Analysis',
        description: 'Master Excel for data analysis including pivot tables, advanced formulas, and business intelligence.',
        instructor: 'Leila Gharani',
        price: 56.99,
        topics: ['Excel', 'Data Analysis', 'Pivot Tables', 'Formulas', 'Business Intelligence', 'Charts']
      }
    ];

    const courses: Partial<Course>[] = [];

    for (let i = 0; i < coursesData.length; i++) {
      const courseData = coursesData[i];

      // Create course (let TypeORM generate the UUID)
      courses.push({
        title: courseData.title,
        description: courseData.description,
        instructor: courseData.instructor,
        price: courseData.price,
        thumbnail_image: 'https://pub-8a6e1a65654a4cfc88a11cb73b88039a.r2.dev/courses/thumbnails/1755855441736-logo.png'
      });
    }

    // Save courses first to get generated IDs
    const savedCourses = await this.courseRepository.save(courses);

    // Now create topics using the saved course IDs
    const allTopics: Partial<CourseTopic>[] = [];
    for (let i = 0; i < savedCourses.length; i++) {
      const courseData = coursesData[i];
      const savedCourse = savedCourses[i];

      // Create topics for this course
      for (const topic of courseData.topics) {
        allTopics.push({
          course_id: savedCourse.id,
          topic: topic
        });
      }
    }

    // Save topics
    await this.courseTopicRepository.save(allTopics);
    
    console.log(`✅ Created ${savedCourses.length} courses with ${allTopics.length} topics`);
  }
}
