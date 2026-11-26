import { render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockApi } from '../../test/mockApi.js';
import { renderRoute } from '../../test/renderRoute.jsx';
import appealFormSource from './AppealForm.jsx?raw';
import fieldsSource from './fields.jsx?raw';
import formContextSource from './FormContext.js?raw';
import { useFormContext } from './FormContext.js';
import showDataSource from './ShowData.jsx?raw';

const STATEMENT =
  'Mức phạt 8 trận cho lỗi rời phòng sớm cao gấp đôi mức chuẩn của giải nên tôi đề nghị xem xét lại hồ sơ.';

let api;

beforeEach(() => {
  api = createMockApi();
  vi.stubGlobal('fetch', api.fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function openForm(path = '/dossier/himass/appeal') {
  const utils = renderRoute(path);
  await screen.findByRole('button', { name: /gửi kháng cáo/i });
  return utils;
}

const field = (label) => screen.getByLabelText(label, { exact: false });
const postCalls = () => api.fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST');

async function fillValid(user) {
  await user.type(field('Họ tên người kháng cáo'), 'Nguyễn Văn Kháng');
  await user.type(field('Email liên hệ'), 'khang@example.com');
  await user.type(field('Nhập lại email'), 'KHANG@example.com');
  await user.selectOptions(field('Lý do kháng cáo'), 'disproportionate-penalty');
  await user.click(field('Nội dung kháng cáo'));
  await user.paste(STATEMENT);
  await user.type(field('Liên kết bằng chứng'), 'https://example.com/vod/42');
  await user.click(screen.getByRole('checkbox', { name: /tôi cam kết/i }));
}

describe('FormContext', () => {
  it('useFormContext throws outside the Provider', () => {
    function Orphan() {
      useFormContext();
      return null;
    }
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/bên trong <AppealForm>/);
  });
});

describe('AppealForm — real-time validation', () => {
  it('labels every control and pre-selects the current dossier', async () => {
    await openForm();
    expect(field('Hồ sơ kháng cáo')).toHaveValue('himass');
    for (const label of ['Họ tên người kháng cáo', 'Email liên hệ', 'Nhập lại email', 'Lý do kháng cáo', 'Nội dung kháng cáo']) {
      expect(field(label)).toBeInTheDocument();
    }
  });

  it('shows the e-mail error right after blur (not while typing), linked via aria-describedby', async () => {
    const { user } = await openForm();
    const email = field('Email liên hệ');
    await user.type(email, 'abc');
    expect(email).not.toHaveAttribute('aria-invalid');
    await user.tab();

    expect(email).toHaveAttribute('aria-invalid', 'true');
    const error = screen.getByRole('alert');
    expect(error).toHaveTextContent(/định dạng/i);
    expect(email.getAttribute('aria-describedby')).toContain(error.id);

    await user.clear(email);
    await user.type(email, 'abc@example.com'); // sửa → lỗi biến mất ngay (derived)
    expect(email).not.toHaveAttribute('aria-invalid');
  });

  it('reports a cross-field error when confirmEmail does not match', async () => {
    const { user } = await openForm();
    await user.type(field('Email liên hệ'), 'khang@example.com');
    await user.type(field('Nhập lại email'), 'khac@example.com');
    await user.tab();
    expect(field('Nhập lại email')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/email nhập lại không khớp/i)).toHaveAttribute('role', 'alert');

    // Sửa EMAIL (field kia) cho khớp → lỗi của confirmEmail tự hết, không cần effect.
    await user.clear(field('Email liên hệ'));
    await user.type(field('Email liên hệ'), 'khac@example.com');
    expect(field('Nhập lại email')).not.toHaveAttribute('aria-invalid');
  });

  it('counts statement characters in a polite live region', async () => {
    const { user } = await openForm();
    await user.type(field('Nội dung kháng cáo'), 'Mười ký tự');
    expect(screen.getByText(/^10\/2000 ký tự — cần thêm 40$/)).toHaveAttribute('aria-live', 'polite');
  });

  it('empty submit → focuses the first invalid field, shows a summary and does not call fetch', async () => {
    const { user } = await openForm();
    const submit = screen.getByRole('button', { name: /gửi kháng cáo/i });
    expect(submit).toBeEnabled(); // không disable nút submit
    await user.click(submit);

    expect(field('Họ tên người kháng cáo')).toHaveFocus(); // playerId đã chọn sẵn → lỗi đầu là họ tên
    const summary = screen.getByRole('alert', { name: /có 6 lỗi cần sửa/i });
    expect(within(summary).getAllByRole('button')).toHaveLength(6);
    expect(postCalls()).toHaveLength(0);

    await user.click(within(summary).getByRole('button', { name: /lý do kháng cáo/i }));
    expect(field('Lý do kháng cáo')).toHaveFocus();
  });

  it('valid payload → POST /api/appeals with the exact body, then renders ShowData as <dl>', async () => {
    const { user } = await openForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /gửi kháng cáo/i }));

    const heading = await screen.findByRole('heading', { name: /đã gửi kháng cáo thành công/i });
    expect(heading).toHaveFocus();
    expect(postCalls()).toHaveLength(1);
    const [url, init] = postCalls()[0];
    expect(url).toBe('/api/appeals');
    expect(init.signal).toBeInstanceOf(AbortSignal);
    expect(JSON.parse(init.body)).toEqual({
      playerId: 'himass',
      appellantName: 'Nguyễn Văn Kháng',
      email: 'khang@example.com',
      confirmEmail: 'KHANG@example.com',
      reason: 'disproportionate-penalty',
      statement: STATEMENT,
      evidenceUrl: 'https://example.com/vod/42',
      acceptTerms: true,
    });

    const dl = heading.closest('section').querySelector('dl');
    expect(dl).not.toBeNull();
    expect(within(dl).getByText('Người kháng cáo').tagName).toBe('DT');
    expect(within(dl).getByText('Nguyễn Văn Kháng').tagName).toBe('DD');
    expect(within(dl).getByText('Mức phạt không tương xứng')).toBeInTheDocument();
    expect(screen.queryByText(/"appellantName"/)).not.toBeInTheDocument(); // không JSON.stringify
  });

  it('server 400 → shows the server message on the right field; editing that field clears it', async () => {
    api = createMockApi({
      postResponse: () =>
        new Response(JSON.stringify({ errors: { appellantName: 'Tên này bị máy chủ từ chối.' } }), { status: 400 }),
    });
    vi.stubGlobal('fetch', api.fetchMock);
    const { user } = await openForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /gửi kháng cáo/i }));

    const name = field('Họ tên người kháng cáo');
    expect(await screen.findByText('Tên này bị máy chủ từ chối.')).toHaveAttribute('role', 'alert');
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveFocus();

    await user.type(name, ' B');
    expect(screen.queryByText('Tên này bị máy chủ từ chối.')).not.toBeInTheDocument();
  });

  it('network failure → shows an alert and keeps the input', async () => {
    api = createMockApi({ fail: { post: true } });
    vi.stubGlobal('fetch', api.fetchMock);
    const { user } = await openForm();
    await fillValid(user);
    await user.click(screen.getByRole('button', { name: /gửi kháng cáo/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to fetch/i);
    expect(field('Họ tên người kháng cáo')).toHaveValue('Nguyễn Văn Kháng');
  });
});

describe('form engine has no useEffect (validation is derived in render)', () => {
  it.each([
    ['FormContext.js', formContextSource],
    ['AppealForm.jsx', appealFormSource],
    ['fields.jsx', fieldsSource],
    ['ShowData.jsx', showDataSource],
  ])('%s does not import or call useEffect', (_file, source) => {
    // Chỉ xét code thật: bỏ comment (JSDoc có nhắc tới chữ "useEffect" để giải thích).
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/\buseEffect\b/);
    expect(code).not.toMatch(/\buseLayoutEffect\b/);
  });

  it('AppealForm computes errors with the shared validateAppeal during render', () => {
    expect(appealFormSource).toMatch(/const clientErrors = validateAppeal\(values\);/);
    expect(appealFormSource).toMatch(/from '@shared\/appealRules\.js'/);
  });
});
