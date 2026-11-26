import { screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildDossierFixtures, createMockApi } from '../test/mockApi.js';
import { renderRoute } from '../test/renderRoute.jsx';

const DAY = 24 * 3_600_000;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SlaCountdown on the dossier page', () => {
  it('shows the remaining time with <time dateTime> and a minute-level live region', async () => {
    vi.stubGlobal('fetch', createMockApi().fetchMock);
    renderRoute('/dossier/himass');
    const value = await screen.findByTestId('sla-value');
    expect(value).toHaveTextContent(/^Còn [34] ngày \d\d:\d\d:\d\d$/);
    expect(value.querySelector('time').getAttribute('datetime')).toMatch(/^P\d+DT\d+H\d+M\d+S$/);
    // Live region chỉ có ngày/giờ/phút — không có giây → không đọc mỗi giây.
    expect(screen.getByTestId('sla-live')).toHaveTextContent(/^Còn \d+ ngày \d+ giờ \d+ phút để kháng cáo\.$/);
    expect(screen.getByTestId('sla-live')).toHaveAttribute('aria-live', 'polite');
    await waitFor(() => expect(screen.getByText(/đã đồng bộ đồng hồ với máy chủ/i)).toBeInTheDocument());
  });

  it('expired dossier: clear expired state, appeal form blocked without calling POST', async () => {
    const api = createMockApi({ dossiers: buildDossierFixtures(Date.now() - 10 * DAY) });
    vi.stubGlobal('fetch', api.fetchMock);
    const { user } = renderRoute('/dossier/himass/appeal');

    expect(await screen.findByTestId('sla-value')).toHaveTextContent('Đã hết hạn kháng cáo');
    expect(screen.getByTestId('sla-live')).toHaveTextContent('Đã hết hạn kháng cáo.');
    expect(await screen.findByText(/đã hết hạn kháng cáo cho hồ sơ này/i)).toHaveAttribute('role', 'alert');

    await user.type(screen.getByLabelText(/họ tên người kháng cáo/i), 'Nguyễn Văn Kháng');
    await user.type(screen.getByLabelText(/^email liên hệ/i), 'khang@example.com');
    await user.type(screen.getByLabelText(/nhập lại email/i), 'khang@example.com');
    await user.selectOptions(screen.getByLabelText(/lý do kháng cáo/i), 'other');
    await user.click(screen.getByLabelText(/nội dung kháng cáo/i));
    await user.paste('x'.repeat(60));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /gửi kháng cáo/i }));

    expect(await screen.findByText(/hết hạn kháng cáo \(SLA\) — không thể gửi/i)).toBeInTheDocument();
    expect(api.fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(0);
  });

  it('server 409 (SLA closed between render and submit) is shown to the user', async () => {
    const api = createMockApi({
      postResponse: () =>
        new Response(JSON.stringify({ error: 'Đã hết hạn kháng cáo (SLA).' }), { status: 409 }),
    });
    vi.stubGlobal('fetch', api.fetchMock);
    const { user } = renderRoute('/dossier/tanvuu/appeal');
    await user.type(await screen.findByLabelText(/họ tên người kháng cáo/i), 'Nguyễn Văn Kháng');
    await user.type(screen.getByLabelText(/^email liên hệ/i), 'khang@example.com');
    await user.type(screen.getByLabelText(/nhập lại email/i), 'khang@example.com');
    await user.selectOptions(screen.getByLabelText(/lý do kháng cáo/i), 'other');
    await user.click(screen.getByLabelText(/nội dung kháng cáo/i));
    await user.paste('x'.repeat(60));
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /gửi kháng cáo/i }));
    expect(await screen.findByText('Đã hết hạn kháng cáo (SLA).')).toHaveAttribute('role', 'alert');
  });
});
