import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@platon/core/browser';
import { CourseService } from '@platon/feature/course/browser';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-course-demo',
  templateUrl: './demo.page.html',
  styleUrls: ['./demo.page.scss'],
  imports: [],
})
export class CourseDemoPage implements OnInit {
  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly courseService: CourseService,
    private readonly authService: AuthService
  ) {}
  async ngOnInit(): Promise<void> {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.redirectToDemo(params.get('id') as string);
    });
  }

  async redirectToDemo(courseId: string) {
    const demoAnswer = await firstValueFrom(
      this.courseService.accessDemo(courseId)
    );
    if (demoAnswer.auth) {
      console.log(demoAnswer);
      await this.authService.signInWithToken({
        accessToken: demoAnswer.accessToken!,
        refreshToken: demoAnswer.refreshToken!,
      });
    }
    this.router.navigate(['/courses', demoAnswer.courseId], {
      replaceUrl: true,
    });
  }
}
