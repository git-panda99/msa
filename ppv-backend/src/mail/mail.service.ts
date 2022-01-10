import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendUserConfirmation(user: User, token: string) {
        const url = `example.com/auth/confirm?token=${token}`;
        console.log(user.firstName);

        await this.mailerService.sendMail({
          to: user.email,
          // from: '"Support Team" <support@example.com>', // override default from
          subject: 'Welcome to PPV App! Confirm your Email',
          template: 'templates/confirmation.hbs', // `.hbs` extension is appended automatically
          context: { // ✏️ filling curly brackets with content
            firstName: user.firstName,
            url,
          },
        })
        .then((success) => {
          console.log(success)
        })
        .catch((err) => {
          console.log(err)
        });
      }
}