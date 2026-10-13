import { Injectable, inject } from '@angular/core'
import { Observable } from 'rxjs'
import { AnnouncementProvider } from '../models/announcement-provider'
import { ListResponse } from '@platon/core/common'
import {
  Announcement,
  AnnouncementFilters,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from '@platon/feature/announcement/common'

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly announcementProvider = inject(AnnouncementProvider)

  /**
   * Recherche des annonces avec filtres (admin uniquement)
   */
  search(filters: AnnouncementFilters = {}): Observable<ListResponse<Announcement>> {
    return this.announcementProvider.search(filters)
  }

  /**
   * Crée une nouvelle annonce (admin uniquement)
   */
  create(announcement: CreateAnnouncementInput): Observable<Announcement> {
    return this.announcementProvider.create(announcement)
  }

  /**
   * Met à jour une annonce existante (admin uniquement)
   */
  update(id: string, announcement: UpdateAnnouncementInput): Observable<Announcement> {
    return this.announcementProvider.update(id, announcement)
  }

  /**
   * Supprime une annonce (admin uniquement)
   */
  delete(id: string): Observable<void> {
    return this.announcementProvider.delete(id)
  }

  /**
   * Récupère les annonces visibles pour l'utilisateur connecté
   */
  getVisibleForUser(filters: AnnouncementFilters = {}): Observable<ListResponse<Announcement>> {
    return this.announcementProvider.getVisibleForUser(filters)
  }

  /**
   * Récupère toutes les annonces actives et visibles pour l'utilisateur
   * (raccourci pour getVisibleForUser sans filtres)
   */
  getActiveAnnouncements(): Observable<ListResponse<Announcement>> {
    return this.getVisibleForUser({ active: true })
  }

  findByIdForUser(id: string): Observable<Announcement> {
    return this.announcementProvider.findByIdForUser(id)
  }

  /** The person signed in has read it: opened it, or closed its banner. */
  markAsRead(id: string): Observable<void> {
    return this.announcementProvider.markAsRead(id)
  }
}
