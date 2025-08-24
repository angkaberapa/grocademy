import { Controller, Get, Render, Req, Param, Query, UseGuards, UnauthorizedException, Headers, Redirect } from '@nestjs/common';
import { AppService } from './app.service';
import { CourseService } from './course/course.service';
import { ModuleService } from './module/module.service';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { User } from './users/users.entity';
import { UserCoursesService } from './user-courses/user-courses.service';

@ApiTags('grocademy')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly courseService: CourseService,
    private readonly userCourseRepository: UserCoursesService,
    private readonly moduleService: ModuleService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('/')
  @Redirect('/login', 302)
  @ApiOperation({ summary: 'Redirect to login page' })
  @ApiResponse({ status: 302, description: 'Redirects to login page' })
  home() {
  }  
  
  @Get('/login')
  @Render('login')
  @ApiOperation({ summary: 'Get login page' })
  @ApiResponse({ status: 200, description: 'Returns the login page' })
  login() {
    return {};
  }

  @Get('/register')
  @Render('register')
  @ApiOperation({ summary: 'Get register page' })
  @ApiResponse({ status: 200, description: 'Returns the register page' })
  register() {
    return {};
  }

  @Get('/browse-courses')
  @Render('browse-courses')
  @ApiOperation({ summary: 'Get browse courses page' })
  @ApiResponse({ status: 200, description: 'Returns the browse courses page' })
  async browseCourses(@Query() query: any) {
    try {
      const page = query.page || '1';
      const limit = query.limit || '6';
      const search = query.search || '';

      const coursesData = await this.courseService.findAll({
        page,
        limit,
        q: search
      });

      return {
        courses: coursesData.data || [],
        currentPage: coursesData.pagination.current_page,
        totalPages: coursesData.pagination.total_pages,
        totalCourses: coursesData.pagination.total_items,
        limit: parseInt(limit),
        searchQuery: search
      };
    } catch (error) {
      return {
        courses: [],
        currentPage: 1,
        totalPages: 0,
        totalCourses: 0,
        limit: 6,
        searchQuery: ''
      };
    }
  }

  @Get('/course/:id')
  @Render('course-detail')
  @ApiOperation({ summary: 'Get course detail page' })
  @ApiResponse({ status: 200, description: 'Returns the course detail page' })
  async courseDetail(@Param('id') courseId: string) {
    return {};
  }

  @Get('/my-courses')
  @Render('my-courses')
  @ApiOperation({ summary: 'Get my courses page' })
  @ApiResponse({ status: 200, description: 'Returns the my courses page' })
  async myCourses() {
    return {};
  }

  @Get('/course/:courseId/modules')
  @Render('course-modules')
  @ApiOperation({ summary: 'Get course modules page' })
  @ApiResponse({ status: 200, description: 'Returns the course modules page' })
  async courseModules(@Param('courseId') courseId: string) {
    return {
      user: null,
      course: null,
      modules: [],
      totalModules: 0,
      completedModules: 0,
      progressPercent: 0
    };
  }

  @Get('/course/:courseId/module/:moduleId')
  @Render('module-viewer')
  @ApiOperation({ summary: 'Get module viewer page' })
  @ApiResponse({ status: 200, description: 'Returns the module viewer page' })
  async moduleViewer(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string
  ) {
    return {
      user: null,
      course: null,
      module: null,
      modules: [],
      currentModuleIndex: -1,
      hasNext: false,
      hasPrevious: false,
      nextModule: null,
      previousModule: null
    };
  }

  @Get('/health')
  @ApiOperation({ summary: 'Get health status' })
  @ApiResponse({ status: 200, description: 'Returns health status' })
  health(): string {
    return 'OK';
  }
}