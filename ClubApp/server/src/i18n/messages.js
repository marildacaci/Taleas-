const messages = {
  en: {
    HEALTH_OK: () => "Server is healthy.",

    VALIDATION_ERROR: (field) =>
      field ? `Validation error on ${field}.` : "Validation error.",

    NOT_FOUND: (resource = "Resource") => `${resource} not found.`,
    INTERNAL_ERROR: () => "Internal server error.",

    CLUB_CREATED: (name) => (name ? `Club "${name}" created.` : "Club created."),
    CLUB_UPDATED: () => "Club updated.",
    CLUB_DELETED: () => "Club deleted.",

    MEMBER_CREATED: () => "Member created.",
    MEMBER_UPDATED: () => "Member updated.",
    MEMBER_DELETED: () => "Member deleted.",

    MEMBERSHIP_CREATED: () => "Membership created.",
    MEMBERSHIP_UPDATED: () => "Membership updated.",
    MEMBERSHIP_DELETED: () => "Membership deleted.",

    ACTIVITY_CREATED: (title) =>
      title ? `Activity "${title}" created.` : "Activity created.",
    ACTIVITY_UPDATED: () => "Activity updated.",
    ACTIVITY_DELETED: () => "Activity deleted.",

    REG_CREATED: () => "Registration created.",
    REG_ALREADY_EXISTS: () => "Member already registered to this activity.",
    REG_NOT_FOUND: () => "Registration not found.",
    REG_CANCELLED: () => "Registration cancelled."
  },

  al: {
    HEALTH_OK: () => "Serveri është në rregull.",

    VALIDATION_ERROR: (field) =>
      field ? `Gabim validimi te ${field}.` : "Gabim validimi.",

    NOT_FOUND: (resource = "Burimi") => `${resource} nuk u gjet.`,
    INTERNAL_ERROR: () => "Gabim i brendshëm i serverit.",

    CLUB_CREATED: (name) => (name ? `Klubi "${name}" u krijua.` : "Klubi u krijua."),
    CLUB_UPDATED: () => "Klubi u përditësua.",
    CLUB_DELETED: () => "Klubi u fshi.",

    MEMBER_CREATED: () => "Anëtari u krijua.",
    MEMBER_UPDATED: () => "Anëtari u përditësua.",
    MEMBER_DELETED: () => "Anëtari u fshi.",

    MEMBERSHIP_CREATED: () => "Anëtarësimi u krijua.",
    MEMBERSHIP_UPDATED: () => "Anëtarësimi u përditësua.",
    MEMBERSHIP_DELETED: () => "Anëtarësimi u fshi.",

    ACTIVITY_CREATED: (title) =>
      title ? `Aktiviteti "${title}" u krijua.` : "Aktiviteti u krijua.",
    ACTIVITY_UPDATED: () => "Aktiviteti u përditësua.",
    ACTIVITY_DELETED: () => "Aktiviteti u fshi.",

    REG_CREATED: () => "Regjistrimi u krijua.",
    REG_ALREADY_EXISTS: () => "Anëtari është tashmë i regjistruar në këtë aktivitet.",
    REG_NOT_FOUND: () => "Regjistrimi nuk u gjet.",
    REG_CANCELLED: () => "Regjistrimi u anulua."
  },

  es: {
    HEALTH_OK: () => "El servidor está correcto.",

    VALIDATION_ERROR: (field) =>
      field ? `Error de validación en ${field}.` : "Error de validación.",

    NOT_FOUND: (resource = "Recurso") => `${resource} no encontrado.`,
    INTERNAL_ERROR: () => "Error interno del servidor.",

    CLUB_CREATED: (name) => (name ? `Club "${name}" creado.` : "Club creado."),
    CLUB_UPDATED: () => "Club actualizado.",
    CLUB_DELETED: () => "Club eliminado.",

    MEMBER_CREATED: () => "Miembro creado.",
    MEMBER_UPDATED: () => "Miembro actualizado.",
    MEMBER_DELETED: () => "Miembro eliminado.",

    MEMBERSHIP_CREATED: () => "Membresía creada.",
    MEMBERSHIP_UPDATED: () => "Membresía actualizada.",
    MEMBERSHIP_DELETED: () => "Membresía eliminada.",

    ACTIVITY_CREATED: (title) =>
      title ? `Actividad "${title}" creada.` : "Actividad creada.",
    ACTIVITY_UPDATED: () => "Actividad actualizada.",
    ACTIVITY_DELETED: () => "Actividad eliminada.",

    REG_CREATED: () => "Registro creado.",
    REG_ALREADY_EXISTS: () => "El miembro ya está registrado en esta actividad.",
    REG_NOT_FOUND: () => "Registro no encontrado.",
    REG_CANCELLED: () => "Registro cancelado."
  }
};

module.exports = messages;
