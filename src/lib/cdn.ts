export function cdn(pathname: string): string {
  const defaultBase = 'https://images.aydocorp.space';
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || process.env.CLOUDFLARE_R2_BUCKET_URL || defaultBase;
  const pathPrefixEnv = process.env.NEXT_PUBLIC_IMAGE_PATH_PREFIX || '';

  if (!pathname) return baseUrl;

  // If pathname already looks absolute (http/https), return as-is
  if (/^https?:\/\//i.test(pathname)) return pathname;

  const cleanBase = (baseUrl || defaultBase).replace(/\/$/, '');
  let cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // Optional path prefix mapping (e.g., if your bucket uses /cdn instead of /images)
  const configuredPrefix = pathPrefixEnv.replace(/\/$/, ''); // '/images' or '' or '/cdn'
  if (configuredPrefix === '') {
    // Default: strip leading '/images' so '/images/foo.jpg' -> '/foo.jpg'
    cleanPath = cleanPath.replace(/^\/images(\/|$)/, '/');
  } else if (configuredPrefix !== '/images') {
    // Replace leading '/images' with configured prefix
    const targetPrefix = configuredPrefix.startsWith('/') ? configuredPrefix : `/${configuredPrefix}`;
    cleanPath = cleanPath.replace(/^\/images(\/|$)/, `${targetPrefix}/`);
  }

  return `${cleanBase}${cleanPath}`;
}

export function bgUrl(pathname: string): string {
  return `url('${cdn(pathname)}')`;
}


