const API_URL = 'https://yang-family.vercel.app';

async function testLogin() {
  try {
    const csrfRes = await fetch(`${API_URL}/api/auth/csrf`);
    const setCookieHeader = csrfRes.headers.get('set-cookie');
    let parsedCookies = '';
    if (setCookieHeader) {
      const cookiesArr = setCookieHeader.split(/,(?=\s*[a-zA-Z0-9_\-\.]+\=)/);
      parsedCookies = cookiesArr.map(c => c.split(';')[0].trim()).join('; ');
    }
    
    const csrfData = await csrfRes.json();
    console.log("CSRF Token:", csrfData.csrfToken);
    console.log("Parsed Cookies:", parsedCookies);

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': parsedCookies,
      'Origin': 'https://yang-family.vercel.app',
      'Referer': 'https://yang-family.vercel.app/'
    };

    const params = new URLSearchParams();
    params.append('email', 'test@example.com');
    params.append('password', 'test');
    params.append('csrfToken', csrfData.csrfToken);
    params.append('redirect', 'false');
    params.append('json', 'true');

    const res = await fetch(`${API_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers,
      body: params.toString(),
    });

    const text = await res.text();
    console.log("Login Status:", res.status);
    console.log("Response:", text.substring(0, 100));
  } catch (e) {
    console.error(e);
  }
}

testLogin();
