import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Định dạng ngày tháng từ chuỗi ISO thành định dạng dễ đọc
 * @param dateString Chuỗi ngày tháng ISO
 * @returns Chuỗi ngày tháng đã định dạng
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Trả về chuỗi gốc nếu không phải ngày hợp lệ
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch (error) {
    return dateString;
  }
}
