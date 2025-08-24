# Author

Michael Alexander Angkawijaya - 13523102

# How to Run the Application

This section provides a comprehensive guide to set up and run the Grocademy application locally on your machine.

## Prerequisites

Before running the application, ensure you have the following installed:

### Required Software
- **Node.js** (v18 or higher) - [Download from nodejs.org](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Docker** - [Download from docker.com](https://www.docker.com/get-started)
- **Docker Compose** (included with Docker Desktop)
- **Git** - [Download from git-scm.com](https://git-scm.com/)

### Verify Installation
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show npm version
docker --version  # Should show Docker version
docker-compose --version  # Should show Docker Compose version
```

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd grocademy
```

## Step 2: Environment Configuration

Copy the example environment file and configure it for your setup:

```bash
cp .env.example .env
```

To test the Cloudflare R2 Bucket, please contact the author (ID Line: brutalwitch) to get the credentials then edit the `.env` file and update the following important values:
`R2_ACCESS_KEY_ID` : your-r2-access-key-id
`R2_SECRET_ACCESS_KEY` : your-r2-secret-access-key
`R2_BUCKET_NAME` : your-bucket-name
`R2_ENDPOINT` : https://your-account-id.r2.cloudflarestorage.com
`R2_PUBLIC_URL` : https://pub-your-bucket-id.r2.dev
`R2_REGION` : auto

## Step 3: Docker Compose

### 3.1 Build and Start with Docker Compose (Development)
```bash
# Build and start all services (database + application)
docker-compose -f docker-compose.dev.yml up --build -d

### 3.2 Access the Application
- **Main Application**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

### 3.3 Stop the Application
```bash
# Stop all services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (clears database data)
docker-compose -f docker-compose.dev.yml down -v
```

## Step 8: Testing the Application

### API Testing
- Visit http://localhost:3000/api/docs for Swagger documentation
- Test endpoints using the interactive Swagger UI
- Use tools like Postman or curl for API testing

### Frontend Testing
- Navigate to http://localhost:3000 for the main application
- Test user registration and login functionality
- Browse courses and test course enrollment

### Admin Testing
- Login to https://labpro-ohl-2025-fe.hmif.dev/login with admin credentials (admin / admin123)
- Test admin-only endpoints
- Verify admin access restrictions work correctly

# Design Patterns

This section describes the design patterns implemented in the Grocademy application. All patterns mentioned here are actually implemented in the codebase and can be found in the specified file locations.

## 1. Dependency Injection Pattern

**Location:** Used throughout the application via NestJS framework

**Implementation:**
- `@Injectable()` decorator on all service classes
- Constructor injection for dependencies
- `@InjectRepository()` for TypeORM repositories

**Example:**
```typescript
// src/course/course.service.ts
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
    private fileStorageService: FileStorageService,
  ) {}
}
```

**Reasons for Implementation:**
- **Loose Coupling**: Dependencies are not hardcoded, making testing and maintenance easier
- **Testability**: Easy to perform mocking for unit testing
- **Scalability**: NestJS framework natively supports this pattern
- **Inversion of Control**: Container manages lifecycle and dependency injection

## 2. Repository Pattern

**Location:** All data access layers using TypeORM Repository

**Implementation:**
- Database operations abstraction through TypeORM Repository
- Each entity has a repository injected into services

**Example:**
```typescript
// src/users/users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
```

**Reasons for Implementation:**
- **Separation of Concerns**: Separates business logic from data access logic
- **Database Abstraction**: Application is not tied to specific database implementation
- **Consistency**: Standardized data access methods throughout the application
- **ORM Integration**: Leverages TypeORM for auto-generated repository methods

## 3. Strategy Pattern

**Location:** JWT Authentication Strategy

**Implementation:**
- `JwtStrategy` class that extends `PassportStrategy`
- Allows multiple authentication strategies

**Example:**
```typescript
// src/auth/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, role: user.role };
  }
}
```

**Reasons for Implementation:**
- **Flexibility**: Easy to add new authentication strategies (OAuth, LDAP, etc.)
- **Encapsulation**: Each strategy has separate validation logic
- **Passport Integration**: Leverages mature Passport.js ecosystem
- **Runtime Selection**: Strategy is selected based on request context

## 4. Decorator Pattern

**Location:** Custom parameter decorators and method decorators

**Implementation:**
- `@CurrentUserId()` custom parameter decorator
- NestJS built-in decorators (`@Controller`, `@Get`, `@Post`, etc.)

**Example:**
```typescript
// src/auth/current-user.decorator.ts
export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.user.id;
  },
);

// Usage:
async getProfile(@CurrentUserId() userId: string) {
  return this.authService.getProfile(userId);
}
```

**Reasons for Implementation:**
- **Clean Code**: Reduces boilerplate code in controller methods
- **Reusability**: Decorators can be used across multiple endpoints
- **Type Safety**: TypeScript support for parameter extraction
- **Framework Integration**: Consistent with NestJS architectural patterns

## 5. Module Pattern

**Location:** Entire application structure using NestJS modules

**Implementation:**
- Each feature has a separate module
- Dependency injection configuration at module level

**Example:**
```typescript
// src/auth/auth.module.ts
@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({...})],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
  async onModuleInit() {
    await this.authService.createAdminUser();
  }
}
```

**Reasons for Implementation:**
- **Modularity**: Application is divided into independent feature modules
- **Encapsulation**: Each module manages its own dependencies
- **Lazy Loading**: Modules can be loaded as needed
- **Testing**: Easy to perform unit testing per module

# Technology Stack

This section details all the technologies, frameworks, and libraries used in the Grocademy application along with their versions.

## Backend Framework
- **NestJS** ^11.0.1 - Progressive Node.js framework for building efficient and scalable server-side applications
- **Node.js** - JavaScript runtime built on Chrome's V8 JavaScript engine
- **TypeScript** ^5.7.3 - Typed superset of JavaScript that compiles to plain JavaScript

## Database
- **PostgreSQL** - Advanced open source relational database
- **TypeORM** ^0.3.25 - Object-Relational Mapping library for TypeScript and JavaScript
- **pg** ^8.16.3 - PostgreSQL client for Node.js

## Authentication & Security
- **Passport.js** ^0.7.0 - Simple, unobtrusive authentication for Node.js
- **passport-jwt** ^4.0.1 - Passport strategy for authenticating with JSON Web Tokens
- **passport-local** ^1.0.0 - Passport strategy for authenticating with username and password
- **@nestjs/jwt** ^11.0.0 - JWT utilities module for NestJS
- **@nestjs/passport** ^11.0.0 - Passport utilities module for NestJS
- **bcryptjs** ^2.4.3 - Library for hashing passwords

## Validation & Transformation
- **class-validator** ^0.14.0 - Decorator-based property validation for classes
- **class-transformer** ^0.5.1 - Decorator-based transformation, serialization, and deserialization

## Frontend Template Engine
- **EJS** ^3.1.10 - Embedded JavaScript templating engine
- **express-ejs-layouts** ^2.5.1 - Layout support for EJS in Express

## File Upload & Processing
- **Multer** ^2.0.2 - Middleware for handling multipart/form-data (file uploads)
- **PDFKit** ^0.17.1 - JavaScript PDF generation library

## API Documentation
- **@nestjs/swagger** ^11.2.0 - OpenAPI (Swagger) module for NestJS
- **swagger-ui-express** ^5.0.1 - Serve auto-generated swagger-ui generated API docs

## Configuration & Environment
- **@nestjs/config** ^4.0.2 - Configuration module for NestJS applications

## Development Environment
- **Package Manager**: npm
- **Runtime**: Node.js (Latest LTS recommended)
- **Database**: PostgreSQL 13+
- **Container**: Docker & Docker Compose
- **Operating System**: Cross-platform (Windows, macOS, Linux)

## Production Dependencies Summary
The application uses a modern TypeScript-based stack with:
- **Backend**: NestJS framework with TypeORM for database operations
- **Database**: PostgreSQL with TypeORM ORM
- **Authentication**: JWT-based authentication with Passport.js
- **Frontend**: Server-side rendering with EJS templates
- **File Processing**: PDF generation and file upload capabilities
- **API Documentation**: Swagger/OpenAPI integration
- **Validation**: Class-based validation and transformation

# Endpoints

## Frontend
GET /                                     (redirect to login page)
GET /login                                (login page)
GET /register                             (register page)
GET /browse-courses                       (browse courses page)
GET /course/{id}                          (course detail page)
GET /my-courses                           (my courses page)
GET /course/{courseId}/modules            (course modules page)
GET /course/{courseId}/module/{moduleId}  (module view page)
GET /health                               (health status page)

## Backend

### users (admin only endpoint)
GET /api/users               (get all user with pagination and search)
GET /api/users/{id}          (get user by ID)
PUT /api/users/{id}          (update user information)
DELETE /api/users/{id}       (delete user by ID)
POST /api/users/{id}/balance (increment user balance)

### courses
POST /api/courses                 (create a new course (admin only))
GET /api/courses                  (get all courses with pagination and search)
GET /api/courses/my-courses       (get courses owned by current user)
GET /api/courses/{id}             (get course by ID)
PUT /api/courses/{id}             (update course by ID (admin only))
DELETE /api/courses/{id}          (delete course by ID (admin only))
POST /api/courses/{id}/buy        (buy a course)
GET /api/courses/{id}/buy-status  (check if user owns a course)
GET /api/courses/{id}/certificate (get course certificate if completed)

### modules
POST /api/courses/{courseId}/modules          (create a new module for a course (admin only))
GET /api/courses/{courseId}/modules           (get all modules for a course)
GET /api/modules/{id}                         (get module by ID)
PUT /api/modules/{id}                         (update module by id (admin only))
DELETE /api/modules/{id}                      (delete module by id (admin only))
PATCH /api/courses/{courseId}/modules/reorder (reorder modules in a course (admin only))
PATCH /api/modules/{id}/complete              (mark module as completed)

### auth
POST /api/auth/login    (user login)
POST /api/auth/register (user register)
GET /api/auth/self      (get current user profile)
POST /api/auth/logout   (user logout)

# Implemented Bonus

# [B05] - Lighthouse 

Overall Score is calculated by averaging the Performance, Accessibility, Best Practices, and SEO scores.

Login Page            Overall Score: 99
Register Page         Overall Score: 99
Browse Courses Page   Overall Score: 97.5
My Courses Page       Overall Score: 96.5
Course Detail Page    Overall Score: 97.25
Course Modules Page   Overall Score: 98.25
Module View Page      Overall Score: 97.25

Average Overall Score: 97.82

# [B06] - Responsive Layout

Please check the Application's Screenshots section

# [B07] - API Documentation

http://localhost:3000/api/docs

# [B08] - SOLID Principles Implementation

This section demonstrates how SOLID principles are applied throughout the Grocademy codebase. All examples provided are from actual implementations in the repository.

## 1. Single Responsibility Principle (SRP)

**Concept:** Each class should have only one reason to change and one responsibility.

**Implementation in Codebase:**

### Service Layer Separation
```typescript
// src/auth/auth.service.ts - Only responsible for authentication
@Injectable()
export class AuthService {
  async login(loginDto: LoginDto, isAdminRequest: boolean = false) { ... }
  async register(registerDto: RegisterDto) { ... }
  async getProfile(userId: string) { ... }
  async createAdminUser() { ... }
}

// src/course/course.service.ts - Only responsible for course operations
@Injectable()
export class CourseService {
  async create(createCourseDto: CreateCourseBodyDto, thumbnailPath?: string) { ... }
  async findAll(query: GetAllCoursesQueryDto) { ... }
  async buyCourse(userId: string, courseId: string) { ... }
}

// src/common/file-storage.service.ts - Only responsible for file management
@Injectable()
export class FileStorageService {
  async saveFile(file: any, category: 'thumbnail' | 'pdf' | 'video') { ... }
  async deleteFile(filePath: string) { ... }
}

// src/common/certificate.service.ts - Only responsible for certificate generation
@Injectable()
export class CertificateService {
  async generateCertificate(data: CertificateData): Promise<string> { ... }
}
```

**Reasons for Implementation:**
- **Maintainability**: Each service is easy to understand and modify
- **Testability**: Testing can be focused on specific functionality
- **Modularity**: Changes to one service do not affect others

## 2. Open/Closed Principle (OCP)

**Concept:** Classes should be open for extension but closed for modification.

**Implementation in Codebase:**

### DTO Inheritance Structure
```typescript
// src/common/dto/response.dto.ts - Base class closed for modification
export abstract class BaseResponseDto {
  @ApiProperty({ description: 'Response status', example: 'success' })
  status: string;
  
  @ApiProperty({ description: 'Response message', example: 'Login successful' })
  message: string;
}

// Extensions - open for extension without modifying base
export class LoginResponseDto extends BaseResponseDto {
  @ApiProperty({ type: LoginResponseDataDto, nullable: true })
  data: LoginResponseDataDto | null;
}

export class CreateCourseResponseDto extends BaseResponseDto {
  @ApiProperty({ type: CreateCourseDataDto, nullable: true })
  data: CreateCourseDataDto | null;
}
```

### Strategy Pattern for Authentication
```typescript
// src/auth/jwt.strategy.ts - Extension without modifying PassportStrategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({ /* configuration */ });
  }
  
  async validate(payload: any) { /* custom validation logic */ }
}

// src/auth/jwt-auth.guard.ts - Extension of AuthGuard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Reasons for Implementation:**
- **Extensibility**: Easy to add new response types without changing base class
- **Backward Compatibility**: Existing code continues to work when adding new features
- **Polymorphism**: Base class can be used for all response types

## 3. Liskov Substitution Principle (LSP)

**Concept:** Objects of subclasses must be able to replace objects of superclass without changing functionality.

**Implementation in Codebase:**

### DTO Substitution
```typescript
// Base DTO can be replaced with child DTO without errors
function handleResponse(response: BaseResponseDto): void {
  console.log(`Status: ${response.status}, Message: ${response.message}`);
}

// All of these are valid because they follow LSP
handleResponse(new LoginResponseDto());
handleResponse(new CreateCourseResponseDto());
handleResponse(new UserDetailResponseDto());
```

### User DTO Hierarchy
```typescript
// src/users/dto/user-response.dto.ts
export class UserDto {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  balance: number;
}

// UserDetailDto can replace UserDto
export class UserDetailDto extends UserDto {
  courses_purchased: number; // Additional property, does not change parent behavior
}
```

**Reasons for Implementation:**
- **Polymorphism**: Child classes can be used where parent class is expected
- **Consistency**: Behavior contract remains consistent across hierarchy
- **Reliability**: Substitution does not cause unexpected behavior

## 4. Interface Segregation Principle (ISP)

**Concept:** Clients should not be forced to depend on interfaces they do not use.

**Implementation in Codebase:**

### Focused Interfaces
```typescript
// src/common/certificate.service.ts - Specific interface for certificate data
export interface CertificateData {
  username: string;
  courseTitle: string;
  instructor: string;
  completionDate: Date;
  userId: string;
  courseId: string;
}

// src/auth/admin.guard.ts - Guard only implements needed CanActivate
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Only implements required method
  }
}
```

### Specific DTO Interfaces
```typescript
// DTOs that are focused and do not force clients to use unnecessary properties
export class LoginDto {
  identifier: string;  // Only what is needed for login
  password: string;
}

export class CreateCourseBodyDto {
  title: string;       // Only what is needed to create course
  description: string;
  instructor: string;
  topics: string[];
  price: number;
}
```

**Reasons for Implementation:**
- **Minimal Dependencies**: Clients only depend on what they actually need
- **Focused Contracts**: Small, specific interfaces are easier to implement
- **Reduced Coupling**: Interface changes do not affect clients that do not use them

## 5. Dependency Inversion Principle (DIP)

**Concept:** High-level modules should not depend on low-level modules. Both should depend on abstractions.

**Implementation in Codebase:**

### Dependency Injection Pattern
```typescript
// src/course/course.service.ts - Depends on Repository abstraction, not concrete class
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,  // TypeORM abstraction
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
    @InjectRepository(UserCourse)
    private userCourseRepository: Repository<UserCourse>,
    private fileStorageService: FileStorageService,  // Service abstraction
  ) {}
}

// src/auth/auth.service.ts - Depends on service abstractions
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,    // Abstraction, not concrete implementation
    private jwtService: JwtService,        // JWT handling abstraction
  ) {}
}
```

### Repository Abstraction
```typescript
// TypeORM Repository pattern - abstraction from database operations
// High-level service does not know about SQL or database specifics
async findById(id: string): Promise<User | null> {
  return this.usersRepository.findOne({ where: { id } });  // Database access abstraction
}
```

### Module-level Dependency Injection
```typescript
// src/auth/auth.module.ts - Configuration abstraction
@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({...})],
  providers: [AuthService, JwtStrategy],  // Abstract dependencies
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

**Reasons for Implementation:**
- **Loose Coupling**: High-level business logic is not tied to specific database implementation
- **Testability**: Easy to perform mocking for unit testing
- **Flexibility**: Can replace implementation (database, storage) without changing business logic
- **Inversion of Control**: Framework (NestJS) manages dependency lifecycle

## Benefits of SOLID Implementation in Grocademy

1. **Maintainability**: Code is easy to maintain because each class has clear responsibilities
2. **Scalability**: System can be extended without breaking existing functionality
3. **Testability**: Each component can be tested independently
4. **Flexibility**: Easy to replace implementations or add new features
5. **Code Reusability**: Components can be reused in different contexts
6. **Reduced Coupling**: Changes in one part do not significantly affect other parts

# [B11] - Bucket

Author use Cloudflare R2 for the cloud provider to store media files.