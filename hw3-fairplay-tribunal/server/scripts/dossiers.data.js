/**
 * DỮ LIỆU GIẢ LẬP PHỤC VỤ BÀI TẬP — mọi vi phạm, hình phạt, đội tuyển và bằng chứng dưới đây
 * đều là HƯ CẤU, không phản ánh hay khẳng định hành vi có thật của bất kỳ người thật nào.
 * Tên hồ sơ "Himass" / "TanVuu" lấy theo case study trong slide của môn học.
 *
 * verdictAt được tính TƯƠNG ĐỐI theo thời điểm seed → SLA kháng cáo luôn còn hạn vài ngày.
 */
const HOUR = 3_600_000;

/**
 * @param {number} [now] epoch ms
 * @returns {import('../src/models/Dossier.js').DossierDoc[]}
 */
export function buildSeedDossiers(now = Date.now()) {
  return [
    {
      playerId: 'himass',
      displayName: 'Himass',
      team: 'Sao Băng Esports (giả lập)',
      role: 'Đường giữa',
      summary:
        'Hồ sơ giả lập: ba vi phạm thủ tục ở giải nội bộ mùa thu. Ban kỷ luật áp dụng tổng cộng 13 trận cấm thi đấu.',
      avatar: '/avatars/himass.svg',
      verdictAt: new Date(now - 24 * HOUR),
      appealWindowHours: 5 * 24, // còn ~4 ngày kể từ lúc seed
      offenses: [
        {
          code: 'HM-01',
          title: 'Rời phòng thi đấu trước khi trọng tài xác nhận kết quả',
          severity: 2,
          penaltyMatches: 8,
          evidence: [
            { kind: 'log', label: 'Nhật ký máy chủ phòng đấu #A12', ref: 'LOG-A12-2209' },
            { kind: 'report', label: 'Biên bản trọng tài trận 3', ref: 'RPT-03-HM' },
          ],
        },
        {
          code: 'HM-02',
          title: 'Check-in trễ lần thứ hai trong cùng giai đoạn',
          severity: 1,
          penaltyMatches: 2,
          evidence: [{ kind: 'log', label: 'Hệ thống check-in vòng bảng', ref: 'CHK-GRP-B-07' }],
        },
        {
          code: 'HM-03',
          title: 'Ngôn từ thiếu chuẩn mực trong kênh chat phòng chờ',
          severity: 3,
          penaltyMatches: 3,
          evidence: [
            { kind: 'screenshot', label: 'Ảnh chụp kênh chat phòng chờ', ref: 'SS-LOBBY-118' },
            { kind: 'report', label: 'Phản ánh của đội đối thủ', ref: 'RPT-OPP-22' },
          ],
        },
      ],
    },
    {
      playerId: 'tanvuu',
      displayName: 'TanVuu',
      team: 'Thiên Hà Gaming (giả lập)',
      role: 'Đi rừng',
      summary:
        'Hồ sơ giả lập: vi phạm về thiết bị và quy định thi đấu tại vòng loại khu vực. Ban kỷ luật áp dụng tổng cộng 18 trận cấm thi đấu.',
      avatar: '/avatars/tanvuu.svg',
      verdictAt: new Date(now - 48 * HOUR),
      appealWindowHours: 7 * 24, // còn ~5 ngày kể từ lúc seed
      offenses: [
        {
          code: 'TV-01',
          title: 'Sử dụng thiết bị ngoại vi chưa đăng ký với ban tổ chức',
          severity: 4,
          penaltyMatches: 10,
          evidence: [
            { kind: 'report', label: 'Biên bản kiểm tra thiết bị trước trận', ref: 'EQP-CHK-41' },
            { kind: 'screenshot', label: 'Ảnh chụp bàn thi đấu số 4', ref: 'SS-DESK-04' },
          ],
        },
        {
          code: 'TV-02',
          title: 'Không mặc đồng phục đội theo quy định khi lên sân khấu',
          severity: 1,
          penaltyMatches: 4,
          evidence: [{ kind: 'screenshot', label: 'Ảnh sân khấu buổi khai mạc', ref: 'SS-STAGE-01' }],
        },
        {
          code: 'TV-03',
          title: 'Có mặt muộn 15 phút so với giờ thi đấu, không báo trước',
          severity: 2,
          penaltyMatches: 4,
          evidence: [
            { kind: 'log', label: 'Nhật ký điểm danh khu vực thi đấu', ref: 'ATT-ZONE-2' },
            { kind: 'replay', label: 'Bản ghi phòng chờ trước trận', ref: 'RPL-LOBBY-77' },
          ],
        },
      ],
    },
  ];
}
