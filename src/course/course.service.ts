import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CourseTopic } from './course-topic.entity';
import { FileStorageService } from '../common/file-storage.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(CourseTopic)
    private courseTopicRepository: Repository<CourseTopic>,
    private fileStorageService: FileStorageService,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.courseRepository.find({
      relations: ['modules', 'userCourses', 'courseTopics'],
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['modules', 'userCourses', 'courseTopics'],
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async create(courseData: Partial<Course>, topics?: string[]): Promise<Course> {
    const course = this.courseRepository.create(courseData);
    const savedCourse = await this.courseRepository.save(course);

    // Add topics if provided
    if (topics && topics.length > 0) {
      await this.addTopicsToCourse(savedCourse.id, topics);
    }

    return this.findOne(savedCourse.id);
  }

  async update(id: string, courseData: Partial<Course>, topics?: string[]): Promise<Course> {
    const course = await this.findOne(id);
    const oldThumbnail = course.thumbnail_image;

    Object.assign(course, courseData);
    const updatedCourse = await this.courseRepository.save(course);

    // Handle thumbnail cleanup if changed
    if (courseData.thumbnail_image && oldThumbnail && oldThumbnail !== courseData.thumbnail_image) {
      await this.fileStorageService.deleteFile(oldThumbnail);
    }

    // Update topics if provided
    if (topics !== undefined) {
      await this.replaceTopics(id, topics);
    }

    return this.findOne(updatedCourse.id);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    
    // Clean up media files
    if (course.thumbnail_image) {
      await this.fileStorageService.deleteFile(course.thumbnail_image);
    }
    
    // Clean up course media (modules will be cascade deleted)
    await this.fileStorageService.deleteCourseMedia(id);
    
    await this.courseRepository.remove(course);
  }

  async addTopicsToCourse(courseId: string, topics: string[]): Promise<void> {
    const topicEntities = topics.map(topic => 
      this.courseTopicRepository.create({ course_id: courseId, topic })
    );
    await this.courseTopicRepository.save(topicEntities);
  }

  async replaceTopics(courseId: string, topics: string[]): Promise<void> {
    // Remove existing topics
    await this.courseTopicRepository.delete({ course_id: courseId });
    
    // Add new topics
    if (topics.length > 0) {
      await this.addTopicsToCourse(courseId, topics);
    }
  }

  async getTopics(courseId: string): Promise<string[]> {
    const topics = await this.courseTopicRepository.find({
      where: { course_id: courseId }
    });
    return topics.map(t => t.topic);
  }
}
