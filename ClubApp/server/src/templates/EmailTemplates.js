function clubDeletedTemplate(lang, { memberName, clubName }) {
  const t = {
    en: {
      subject: `Club "${clubName}" has been deleted`,
      body: `Hi ${memberName},<br/>The club <b>${clubName}</b> has been deleted. Your membership is no longer active.`
    },
    al: {
      subject: `Klubi "${clubName}" u fshi`,
      body: `Përshëndetje ${memberName},<br/>Klubi <b>${clubName}</b> u fshi. Anëtarësimi yt nuk është më aktiv.`
    },
    es: {
      subject: `El club "${clubName}" fue eliminado`,
      body: `Hola ${memberName},<br/>El club <b>${clubName}</b> fue eliminado. Tu membresía ya no está activa.`
    }
  }[lang] || t.en;

  return { subject: t.subject, html: t.body };
}

function registrationCreatedTemplate(lang, { memberName, activityTitle, clubName, startsAt }) {
  const dateStr = new Date(startsAt).toLocaleString();
  const t = {
    en: {
      subject: `Registration confirmed: ${activityTitle}`,
      body: `Hi ${memberName},<br/>You are registered for <b>${activityTitle}</b> at <b>${clubName}</b> on ${dateStr}.`
    },
    al: {
      subject: `Regjistrimi u konfirmua: ${activityTitle}`,
      body: `Përshëndetje ${memberName},<br/>Je regjistruar në <b>${activityTitle}</b> te <b>${clubName}</b> më ${dateStr}.`
    },
    es: {
      subject: `Registro confirmado: ${activityTitle}`,
      body: `Hola ${memberName},<br/>Estás registrado en <b>${activityTitle}</b> en <b>${clubName}</b> el ${dateStr}.`
    }
  }[lang] || t.en;

  return { subject: t.subject, html: t.body };
}

function membershipCreatedTemplate(lang, { memberName, clubName, planName, price, startDate, endDate }) {
  const start = startDate ? new Date(startDate).toLocaleDateString() : "";
  const end = endDate ? new Date(endDate).toLocaleDateString() : "";

  const t = {
    en: {
      subject: `Membership confirmed - ${clubName}`,
      body: `
        <h2>Membership Confirmation</h2>
        <p>Hi ${memberName},</p>
        <p>You are now a member of <b>${clubName}</b>.</p>
        <ul>
          <li><b>Plan:</b> ${planName}</li>
          <li><b>Price:</b> ${price}</li>
          <li><b>Start:</b> ${start}</li>
          <li><b>End:</b> ${end}</li>
        </ul>
      `
    },
    al: {
      subject: `Anëtarësimi u konfirmua - ${clubName}`,
      body: `
        <h2>Konfirmim Anëtarësimi</h2>
        <p>Përshëndetje ${memberName},</p>
        <p>Tani je anëtar i <b>${clubName}</b>.</p>
        <ul>
          <li><b>Plani:</b> ${planName}</li>
          <li><b>Çmimi:</b> ${price}</li>
          <li><b>Fillimi:</b> ${start}</li>
          <li><b>Mbarimi:</b> ${end}</li>
        </ul>
      `
    },
    es: {
      subject: `Membresía confirmada - ${clubName}`,
      body: `
        <h2>Confirmación de Membresía</h2>
        <p>Hola ${memberName},</p>
        <p>Ahora eres miembro de <b>${clubName}</b>.</p>
        <ul>
          <li><b>Plan:</b> ${planName}</li>
          <li><b>Precio:</b> ${price}</li>
          <li><b>Inicio:</b> ${start}</li>
          <li><b>Fin:</b> ${end}</li>
        </ul>
      `
    }
  }[lang] || t.en;

  return { subject: t.subject, html: t.body };
}

module.exports = {
  clubDeletedTemplate,
  registrationCreatedTemplate,
  membershipCreatedTemplate
};
