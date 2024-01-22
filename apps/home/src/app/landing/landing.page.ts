import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { gsap } from 'gsap'
import { ScrollTrigger, TextPlugin } from 'gsap/all'
import { SectionAboutComponent } from './section-about/section-about.component'
import { SectionDemoComponent } from './section-demo/section-demo.component'
import { SectionFeaturesComponent } from './section-features/section-features.component'
import { SectionFooterComponent } from './section-footer/section-footer.component'
import { SectionHeroComponent } from './section-hero/section-hero.component'
import { SectionOperatingComponent } from './section-operating/section-operating.component'
import { SectionHeaderComponent } from './section-header/section-header.component'
import { LandingService } from './landing.service'
import { CommonModule } from '@angular/common'

gsap.registerPlugin(TextPlugin, ScrollTrigger)

@Component({
  standalone: true,
  selector: 'app-landing',
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    SectionHeaderComponent,
    SectionHeroComponent,
    SectionAboutComponent,
    SectionOperatingComponent,
    SectionFeaturesComponent,
    SectionDemoComponent,
    SectionFooterComponent,
  ],
})
export class LandingPage implements OnInit {
  private readonly api = inject(LandingService)
  protected readonly demos = this.api.listDemoLinks()

  ngOnInit(): void {
    gsap.utils.toArray<string>('.smooth-reveal').forEach((section) => {
      gsap.from(section, {
        duration: 1,
        opacity: 0,
        y: 50,
        ease: 'power1.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'bottom top',
          toggleActions: 'play none none none',
        },
      })
    })
  }
}
