export const categorizeComplaint = (title, description) => {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  if (text.match(/\b(software|app|program|login|portal|website)\b/)) return 'IT / Software';
  if (text.match(/\b(internet|wifi|router|speed|connection|network)\b/)) return 'Network / Internet';
  if (text.match(/\b(light|fan|switch|power|ac|electricity|bulb|wire)\b/)) return 'Electrical';
  if (text.match(/\b(machine|engine|motor|lift|elevator|equipment|washer)\b/)) return 'Mechanical / Equipment';
  if (text.match(/\b(water|tap|leak|flush|toilet|pipe|sink|drain)\b/)) return 'Plumbing';
  if (text.match(/\b(food|mess|meal|tasty|kitchen|catering|poison|poisoning|stale|eating|ingredients)\b/)) return 'Food Safety / Catering';
  if (text.match(/\b(health|medical|sick|doctor|injury|fever|pain|stomach|headache)\b/)) return 'Health / Medical';
  if (text.match(/\b(security|safety|guard|theft|stolen|lost|key|lock)\b/)) return 'Security / Safety';
  return 'Other';
};

export const determinePriority = (title, description) => {
  const text = `${title || ''} ${description || ''}`.toLowerCase();
  if (text.match(/\b(urgent|emergency|now|leak|spark|fire|broken|blood|theft|robbery)\b/)) return 'Urgent';
  if (text.match(/\b(fast|quick|soon|important|pain)\b/)) return 'High';
  return 'Medium';
};

export const calculateSLA = (category) => {
  const now = new Date();
  switch (category) {
    case 'Electrical': now.setHours(now.getHours() + 24); break;
    case 'Plumbing': now.setHours(now.getHours() + 12); break;
    case 'IT / Software': now.setHours(now.getHours() + 48); break;
    case 'Network / Internet': now.setHours(now.getHours() + 24); break;
    case 'Mechanical / Equipment': now.setHours(now.getHours() + 48); break;
    case 'Food Safety / Catering': now.setHours(now.getHours() + 6); break;
    case 'Health / Medical': now.setHours(now.getHours() + 2); break;
    case 'Security / Safety': now.setHours(now.getHours() + 2); break;
    case 'Urgent': now.setHours(now.getHours() + 2); break;
    default: now.setHours(now.getHours() + 72); break;
  }
  return now;
};
