import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('grocademy')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @Render('index')
  @ApiOperation({ summary: 'Get home page' })
  @ApiResponse({ status: 200, description: 'Returns the home page' })
  home() {
    return { name: 'Tuan Mik' };
  }

  @Get('/hello')
  @ApiOperation({ summary: 'Get hello message' })
  @ApiResponse({ status: 200, description: 'Returns hello world message' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/health')
  @ApiOperation({ summary: 'Get health status' })
  @ApiResponse({ status: 200, description: 'Returns health status' })
  health(): string {
    return 'OK';
  }
}