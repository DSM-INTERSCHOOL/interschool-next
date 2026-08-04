export const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const isPast = diffTime < 0;
    const absDiffTime = Math.abs(diffTime);

    const diffMinutes = Math.floor(absDiffTime / (1000 * 60));
    const diffHours = Math.floor(absDiffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(absDiffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);
    const remainingDaysAfterWeeks = diffDays % 7;
    const diffMonths = Math.floor(diffDays / 30);
    const remainingDaysAfterMonths = diffDays % 30;
    const diffYears = Math.floor(diffDays / 365);
    const remainingDaysAfterYears = diffDays % 365;

    // Para fechas futuras
    if (!isPast) {
        if (diffMinutes < 1) return "En menos de 1 minuto";
        if (diffMinutes < 60) return `En ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
        if (diffHours < 24) return `En ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Mañana";
        if (diffDays < 7) return `En ${diffDays} días`;
        if (diffWeeks < 4) {
            const weekText = `En ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
            return remainingDaysAfterWeeks > 0 ? `${weekText} ${remainingDaysAfterWeeks} ${remainingDaysAfterWeeks === 1 ? 'día' : 'días'}` : weekText;
        }
        if (diffMonths < 12) {
            const monthText = `En ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
            return remainingDaysAfterMonths > 0 ? `${monthText} ${remainingDaysAfterMonths} ${remainingDaysAfterMonths === 1 ? 'día' : 'días'}` : monthText;
        }
        const yearText = `En ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
        return remainingDaysAfterYears > 0 ? `${yearText} ${remainingDaysAfterYears} ${remainingDaysAfterYears === 1 ? 'día' : 'días'}` : yearText;
    }

    // Para fechas pasadas
    if (diffMinutes < 1) return "Hace menos de 1 minuto";
    if (diffMinutes < 60) return `Hace ${diffMinutes} ${diffMinutes === 1 ? 'minuto' : 'minutos'}`;
    if (diffHours < 24) return `Hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffWeeks < 4) {
        const weekText = `Hace ${diffWeeks} ${diffWeeks === 1 ? 'semana' : 'semanas'}`;
        return remainingDaysAfterWeeks > 0 ? `${weekText} ${remainingDaysAfterWeeks} ${remainingDaysAfterWeeks === 1 ? 'día' : 'días'}` : weekText;
    }
    if (diffMonths < 12) {
        const monthText = `Hace ${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
        return remainingDaysAfterMonths > 0 ? `${monthText} ${remainingDaysAfterMonths} ${remainingDaysAfterMonths === 1 ? 'día' : 'días'}` : monthText;
    }
    const yearText = `Hace ${diffYears} ${diffYears === 1 ? 'año' : 'años'}`;
    return remainingDaysAfterYears > 0 ? `${yearText} ${remainingDaysAfterYears} ${remainingDaysAfterYears === 1 ? 'día' : 'días'}` : yearText;
};
