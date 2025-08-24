import {
  create,
  getAll,
  getById,
  update,
  remove,
  addPersons,
  removePersons,
  getPersons,
  like,
  unlike,
  getLikes,
  addView,
  getViews,
  addComment,
  getComments,
  removeComment,
  updateComment,
} from './announcement.service';
import { IAnnouncementCreate, IAnnouncementUpdate } from '@/interfaces/IAnnouncement';

// Ejemplo de uso del servicio de anuncios

export const announcementServiceExample = {
  // Crear un nuevo anuncio
  async createAnnouncement() {
    const newAnnouncement: IAnnouncementCreate = {
      title: "Reunión de padres",
      content: "Se convoca a todos los padres a la reunión mensual",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días después
      accept_comments: true,
      authorized: false,
      academic_year: "2024-2025",
      academic_stages: ["primaria", "secundaria"],
      publisher_person_id: "user-123",
      persons: ["person-1", "person-2", "person-3"],
    };

    try {
      const announcement = await create({
        schoolId: 1,
        dto: newAnnouncement,
      });
      console.log('Anuncio creado:', announcement);
      return announcement;
    } catch (error) {
      console.error('Error al crear anuncio:', error);
      throw error;
    }
  },

  // Obtener todos los anuncios de una escuela
  async getAnnouncements() {
    try {
      const announcements = await getAll({
        schoolId: 1,
        page: 1,
        per_page: 20,
        filters: "status=active",
      });
      console.log('Anuncios obtenidos:', announcements);
      return announcements;
    } catch (error) {
      console.error('Error al obtener anuncios:', error);
      throw error;
    }
  },

  // Obtener un anuncio específico
  async getAnnouncement(announcementId: string) {
    try {
      const announcement = await getById({
        schoolId: 1,
        announcementId,
      });
      console.log('Anuncio obtenido:', announcement);
      return announcement;
    } catch (error) {
      console.error('Error al obtener anuncio:', error);
      throw error;
    }
  },

  // Actualizar un anuncio
  async updateAnnouncement(announcementId: string) {
    const updateData: IAnnouncementUpdate = {
      title: "Reunión de padres - ACTUALIZADO",
      content: "Se convoca a todos los padres a la reunión mensual. Fecha actualizada.",
      authorized: true,
      authorized_by: "admin-123",
      authorized_on: new Date().toISOString(),
    };

    try {
      const announcement = await update({
        schoolId: 1,
        announcementId,
        dto: updateData,
      });
      console.log('Anuncio actualizado:', announcement);
      return announcement;
    } catch (error) {
      console.error('Error al actualizar anuncio:', error);
      throw error;
    }
  },

  // Eliminar un anuncio
  async deleteAnnouncement(announcementId: string) {
    try {
      await remove({
        schoolId: 1,
        announcementId,
      });
      console.log('Anuncio eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar anuncio:', error);
      throw error;
    }
  },

  // Agregar personas a un anuncio
  async addPersonsToAnnouncement(announcementId: string) {
    try {
      const result = await addPersons({
        schoolId: 1,
        announcementId,
        dto: {
          persons: ["person-4", "person-5", "person-6"],
        },
      });
      console.log('Personas agregadas al anuncio:', result);
      return result;
    } catch (error) {
      console.error('Error al agregar personas:', error);
      throw error;
    }
  },

  // Obtener personas de un anuncio
  async getAnnouncementPersons(announcementId: string) {
    try {
      const persons = await getPersons({
        schoolId: 1,
        announcementId,
        page: 1,
        per_page: 50,
      });
      console.log('Personas del anuncio:', persons);
      return persons;
    } catch (error) {
      console.error('Error al obtener personas del anuncio:', error);
      throw error;
    }
  },

  // Dar like a un anuncio
  async likeAnnouncement(announcementId: string, personId: string) {
    try {
      const like = await like({
        schoolId: 1,
        announcementId,
        personId,
      });
      console.log('Like agregado:', like);
      return like;
    } catch (error) {
      console.error('Error al dar like:', error);
      throw error;
    }
  },

  // Quitar like de un anuncio
  async unlikeAnnouncement(announcementId: string, personId: string) {
    try {
      const unlike = await unlike({
        schoolId: 1,
        announcementId,
        personId,
      });
      console.log('Like removido:', unlike);
      return unlike;
    } catch (error) {
      console.error('Error al quitar like:', error);
      throw error;
    }
  },

  // Obtener likes de un anuncio
  async getAnnouncementLikes(announcementId: string) {
    try {
      const likes = await getLikes({
        schoolId: 1,
        announcementId,
        page: 1,
        per_page: 50,
      });
      console.log('Likes del anuncio:', likes);
      return likes;
    } catch (error) {
      console.error('Error al obtener likes:', error);
      throw error;
    }
  },

  // Agregar vista a un anuncio
  async addAnnouncementView(announcementId: string) {
    try {
      const view = await addView({
        schoolId: 1,
        announcementId,
      });
      console.log('Vista agregada:', view);
      return view;
    } catch (error) {
      console.error('Error al agregar vista:', error);
      throw error;
    }
  },

  // Obtener vistas de un anuncio
  async getAnnouncementViews(announcementId: string) {
    try {
      const views = await getViews({
        schoolId: 1,
        announcementId,
        page: 1,
        per_page: 50,
      });
      console.log('Vistas del anuncio:', views);
      return views;
    } catch (error) {
      console.error('Error al obtener vistas:', error);
      throw error;
    }
  },

  // Agregar comentario a un anuncio
  async addAnnouncementComment(announcementId: string, personId: string) {
    try {
      const comment = await addComment({
        schoolId: 1,
        announcementId,
        dto: {
          person_id: personId,
          comment: "Excelente información, gracias por compartir.",
        },
      });
      console.log('Comentario agregado:', comment);
      return comment;
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      throw error;
    }
  },

  // Obtener comentarios de un anuncio
  async getAnnouncementComments(announcementId: string) {
    try {
      const comments = await getComments({
        schoolId: 1,
        announcementId,
        page: 1,
        per_page: 20,
      });
      console.log('Comentarios del anuncio:', comments);
      return comments;
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      throw error;
    }
  },

  // Actualizar un comentario
  async updateAnnouncementComment(announcementId: string, commentId: string) {
    try {
      const comment = await updateComment({
        schoolId: 1,
        announcementId,
        commentId,
        dto: {
          comment: "Comentario actualizado con nueva información.",
        },
      });
      console.log('Comentario actualizado:', comment);
      return comment;
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      throw error;
    }
  },

  // Eliminar un comentario
  async deleteAnnouncementComment(announcementId: string, commentId: string) {
    try {
      await removeComment({
        schoolId: 1,
        announcementId,
        commentId,
      });
      console.log('Comentario eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      throw error;
    }
  },
};

// Ejemplo de uso en un componente React
export const useAnnouncementService = () => {
  return {
    // Métodos principales
    createAnnouncement: announcementServiceExample.createAnnouncement,
    getAnnouncements: announcementServiceExample.getAnnouncements,
    getAnnouncement: announcementServiceExample.getAnnouncement,
    updateAnnouncement: announcementServiceExample.updateAnnouncement,
    deleteAnnouncement: announcementServiceExample.deleteAnnouncement,

    // Gestión de personas
    addPersonsToAnnouncement: announcementServiceExample.addPersonsToAnnouncement,
    getAnnouncementPersons: announcementServiceExample.getAnnouncementPersons,

    // Gestión de likes
    likeAnnouncement: announcementServiceExample.likeAnnouncement,
    unlikeAnnouncement: announcementServiceExample.unlikeAnnouncement,
    getAnnouncementLikes: announcementServiceExample.getAnnouncementLikes,

    // Gestión de vistas
    addAnnouncementView: announcementServiceExample.addAnnouncementView,
    getAnnouncementViews: announcementServiceExample.getAnnouncementViews,

    // Gestión de comentarios
    addAnnouncementComment: announcementServiceExample.addAnnouncementComment,
    getAnnouncementComments: announcementServiceExample.getAnnouncementComments,
    updateAnnouncementComment: announcementServiceExample.updateAnnouncementComment,
    deleteAnnouncementComment: announcementServiceExample.deleteAnnouncementComment,
  };
};

