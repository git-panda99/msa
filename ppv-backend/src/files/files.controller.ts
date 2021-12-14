import { Controller, Get, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('files')
@Controller('files')
export class FilesController {
    
    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        type: 'multipart/form-data',
        required: true,
        schema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              format: 'binary'
            }
          }
        }
      })
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
            return cb(null, `${randomName}${extname(file.originalname)}`)
          }
        }),
        fileFilter: imageFileFilter,
      }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        const response = {
            originalname: file.originalname,
            filename: file.filename,
          };
        return response;
    }
    /*
    //source: https://github.com/TannerGabriel/Blog/tree/master/nest-file-uploading/src
    @Post('multiple')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FilesInterceptor('file', 20, {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
                return cb(null, `${randomName}${extname(file.originalname)}`)
              }
        }),
        fileFilter: imageFileFilter,
        }),
    )
    async uploadMultipleFiles(@UploadedFiles() files) {
        const response = [];
        files.forEach(file => {
        const fileReponse = {
            originalname: file.originalname,
            filename: file.filename,
        };
        response.push(fileReponse);
        });
        return response;
    }
    */
    @Get(':imgpath')
    @ApiParam({
        name: 'imgpath',
        type: 'string',
        description: 'Get the image path',
      })
    seeUploadedFile(@Param('imgpath') image, @Res() res) {
        return res.sendFile(image, { root: './uploads' });
    }
}


  export const imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};