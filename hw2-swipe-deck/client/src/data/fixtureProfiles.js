/**
 * Fixture cho test / phát triển offline — cùng shape với GET /api/profiles.
 * Nhân vật hư cấu (trích từ server/scripts/profiles.data.js).
 * @type {readonly import('../lib/deck.js').Profile[]}
 */
export const FIXTURE_PROFILES = Object.freeze([
  { _id: 'f01', name: 'Trần Mây Lững', age: 24, bio: 'Hẹn cà phê lúc 7h, thường tới lúc 9h.', interests: ['cà phê muối', 'ngủ nướng'], avatar: '/avatars/may-lung.svg' },
  { _id: 'f02', name: 'Lê Gió Thoảng', age: 27, bio: 'Chuyên gia "đã xem" tin nhắn.', interests: ['chạy bộ', 'mèo'], avatar: '/avatars/gio-thoang.svg' },
  { _id: 'f03', name: 'Phạm Nắng Muộn', age: 22, bio: 'Deadline là người yêu duy nhất.', interests: ['code dạo', 'trà sữa'], avatar: '/avatars/nang-muon.svg' },
  { _id: 'f04', name: 'Võ Sương Sớm', age: 29, bio: 'Biết nấu đúng một món: mì gói nâng cao.', interests: ['du lịch bụi'], avatar: '/avatars/suong-som.svg' },
]);
