import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { gsap } from 'gsap'

@Component({
  standalone: true,
  selector: 'app-landing-section-hero',
  templateUrl: './section-hero.component.html',
  styleUrls: ['./section-hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionHeroComponent implements OnInit {
  ngOnInit(): void {
    gsap.from('.hero-content, .hero-illustration', {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
    })
    const words = ['Mathématiques', `Informatique`, 'Langues', 'Biochimie', `Interdisciplinaire`]

    let currentWordIndex = 0
    const typingSpeed = 0.2 // Time per character

    const typeWord = (word: string) => {
      gsap.to('#animated-text', {
        duration: word.length * typingSpeed,
        text: word,
        ease: 'none',
        onComplete: () => {
          gsap.delayedCall(2, eraseWord)
        },
      })
    }

    const eraseWord = () => {
      const word = words[currentWordIndex]
      gsap.to('#animated-text', {
        duration: word.length * typingSpeed,
        text: '',
        ease: 'none',
        onComplete: () => {
          currentWordIndex = (currentWordIndex + 1) % words.length
          typeWord(words[currentWordIndex])
        },
      })
    }

    typeWord(words[currentWordIndex])
  }
}
