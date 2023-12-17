import { ChangeDetectionStrategy, Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

type Feature = {
  id: string
  icon: string
  image: string
  title: string
  description: string
}

@Component({
  standalone: true,
  selector: 'app-landing-section-features',
  templateUrl: './section-features.component.html',
  styleUrls: ['./section-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
})
export class SectionFeaturesComponent {
  protected readonly features: Feature[] = [
    {
      id: 'ide',
      icon: 'code',
      title: 'IDE intégré',
      image: 'assets/images/screens/ide.png',
      description:
        'Un environnement de développement intégré complet pour créer des exercices interactifs avec un support de langage de programmation avancé, des outils de débogage et une prévisualisation en temps réel.',
    },
    {
      id: 'visual-editor',
      icon: 'edit',
      title: 'Éditeur Visuel',
      image: 'assets/images/screens/wysiwyg.png',
      description:
        'Un éditeur WYSIWYG (What You See Is What You Get) intuitif permettant de construire des pages Web et des exercices sans nécessiter de compétences en codage, grâce à une interface glisser-déposer facile à utiliser.',
    },
    {
      id: 'secure-execution',
      icon: 'verified_user',
      title: 'Exécution sécurisé',
      image: 'assets/images/screens/sandbox.png',
      description: `Une technologie sandbox avancée garantissant la sécurité et l'isolement du code exécuté, pour protéger la plateforme et ses utilisateurs contre les codes malveillants ou les erreurs d'exécution.`,
    },
    {
      id: 'user-management',
      icon: 'people',
      title: 'Gestion utilisateurs',
      image: 'assets/images/screens/admin.png',
      description: `Outils complets de gestion des utilisateurs, permettant l'administration des comptes, la gestion des rôles, et le suivi des activités des utilisateurs sur la plateforme.`,
    },
    {
      id: 'circles',
      icon: 'group_work',
      title: 'Collaboration en cercles',
      image: 'assets/images/screens/circle.png',
      description:
        'Un système unique de collaboration en cercles, permettant aux utilisateurs de s’organiser en groupes de travail pour une meilleure gestion et partage des ressources éducatives.',
    },
    {
      id: 'course-management',
      icon: 'menu_book',
      title: 'Gestion de cours',
      image: 'assets/images/screens/course.png',
      description: `Outils de gestion de cours permettant aux enseignants de créer, organiser et gérer des cours et des modules d'apprentissage, avec la possibilité de suivre les progrès des élèves.`,
    },
    {
      id: 'dashboard',
      icon: 'dashboard',
      title: 'Tableaux de bord',
      image: 'assets/images/screens/dashboard.png',
      description:
        "Des tableaux de bord complets offrant des statistiques et des analyses en temps réel sur l'utilisation de la plateforme, les performances des élèves et l'efficacité des cours.",
    },
    {
      id: 'lms-integration',
      icon: 'school',
      title: 'Intégration LMS',
      image: 'assets/images/screens/lms.png',
      description:
        "Intégration transparente avec divers systèmes de gestion de l'apprentissage (LMS) tels que Moodle, Canvas, et Blackboard, facilitant la synchronisation des données et la cohérence de l'expérience éducative.",
    },
  ]

  protected activeFeature = this.features[0]
}
