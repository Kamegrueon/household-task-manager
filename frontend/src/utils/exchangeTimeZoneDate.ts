import { toZonedTime, fromZonedTime, format } from 'date-fns-tz';

export const toJstDateFormat = (date: string | undefined, fmt: string = "yyyy-MM-dd'T'HH:mm") => {
  const utcDate = new Date(`${date}Z`);
  if (isNaN(utcDate.getTime())) {
      throw new Error('実施日が無効な値です。');
  }

  const jstDate = toZonedTime(utcDate, 'Asia/Tokyo');
  const formattedDate = format(jstDate, fmt, { timeZone: 'Asia/Tokyo' });
  return formattedDate
}

export const toUtcDateFormat = (date: string | undefined) => {
    if (!date) {
        throw new Error('実施日が未設定です。');
    }

    const utcDate = fromZonedTime(date, 'Asia/Tokyo');
    if (isNaN(utcDate.getTime())) {
        throw new Error('実施日が無効な値です。');
    }

    const utcIsoString = utcDate.toISOString();

    return utcIsoString
}