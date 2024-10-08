import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseInterceptors,
  Req,
  UploadedFiles,
} from '@nestjs/common';
import { AppService } from './app.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('video')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 },
      ],
      {
        dest: './uploads',
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            return cb(
              null,
              `${Date.now()}-${randomUUID()}-${extname(file.originalname)}`,
            );
          },
        }),
        fileFilter: (req, file, cb) => {
          if (file.mimetype !== 'video/mp4' && file.mimetype !== 'image/jpeg') {
            return cb(
              new BadRequestException(
                'Invalid file type. Only video/mp4 and image/jpeg files are supported',
              ),
              false,
            );
          }
          return cb(null, true);
        },
      },
    ),
  )
  async uploadVideo(
    @Req() _req: Request,
    @UploadedFiles()
    files: { video?: Express.Multer.File[]; thumbnail?: Express.Multer.File[] },
  ): Promise<string> {
    console.log(files);
    return 'Video uploaded successfully';
  }
}
