import { POST, GET } from "@/app/api/auth/logout/route";

function toHeaders(record: Headers) {
  const out: Record<string, string> = {};
  for (const [k, v] of (record as any).entries()) out[k] = v;
  return out;
}

function expectLocationPathIsRoot(locationValue: string | null) {
  expect(locationValue).toBeTruthy();
  // Location may be absolute (e.g., http://localhost:9200/). Parse & assert pathname.
  const url = new URL(locationValue as string, "http://dummy-base.local");
  expect(url.pathname).toBe("/");
}

describe("/api/auth/logout", () => {
  test("POST clears lp_sess and redirects to /", async () => {
    const req = new Request("http://localhost:9200/api/auth/logout", {
      method: "POST",
    });
    const res = await POST(req);

    expect([302, 307, 308]).toContain(res.status);

    const headers = toHeaders(res.headers);
    expectLocationPathIsRoot(headers.location);

    const setCookie = res.headers.get("set-cookie") || "";
    // In Next 14+, clearing often uses Max-Age=0 or an Expires date in the past
    expect(setCookie).toMatch(/lp_sess=/i);
    expect(setCookie).toMatch(/(Max-Age=0|Expires=)/i);
  });

  test("GET clears lp_sess and redirects to /", async () => {
    const req = new Request("http://localhost:9200/api/auth/logout", {
      method: "GET",
    });
    const res = await GET(req);

    expect([302, 307, 308]).toContain(res.status);
    expectLocationPathIsRoot(res.headers.get("location"));

    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toMatch(/lp_sess=/i);
    expect(setCookie).toMatch(/(Max-Age=0|Expires=)/i);
  });
});
