# AydoCorp Corporate Website

Official website for Aydo Intergalactic Corporation, a leading provider of interstellar logistics and shipping services.

## Features

- Modern, responsive design with advanced UI/UX
- Secure employee portal with authentication
- Interactive interface with real-time updates
- Comprehensive information about our services and operations
- Secure contact system and corporate communications
- Mobile-optimized for field operatives

## Tech Stack

- Next.js 14.2.4 with App Router (security patched)
- TypeScript for enhanced reliability
- Tailwind CSS for modern styling
- Framer Motion for interface animations
- NextAuth for secure authentication
- React for dynamic components

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aydocorp-website.git
cd aydocorp-website
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with the following configuration:
```env
NEXTAUTH_SECRET='[Generate with: openssl rand -hex 32]'
NEXTAUTH_URL='http://localhost:3000'
DATABASE_URL='your-database-connection-string'
```

4. Run the development server:
```bash
npm run dev
```

5. Access the development environment at [http://localhost:3000](http://localhost:3000)

## Deployment with AWS Amplify

This project is configured for deployment with AWS Amplify. The configuration is defined in the `amplify.yml` file.

1. Connect your GitHub repository to AWS Amplify
2. Amplify will automatically detect the configuration in `amplify.yml`
3. Make sure to set the required environment variables in the Amplify Console:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (set to your production URL)
   - DATABASE_URL

Note: The build process has been optimized to handle dependencies correctly and avoid issues with deprecated packages.

## Project Structure

```
src/
├── app/                    # Core application directory
│   ├── about/             # Corporate information
│   ├── services/          # Service offerings
│   ├── join/              # Recruitment portal
│   ├── contact/           # Communications hub
│   ├── dashboard/         # Employee interface
│   └── api/               # Backend services
├── components/            # Interface components
└── styles/               # Visual styling
```

## Security

This project is regularly updated to address security vulnerabilities. Recent security updates include:

- Updated to Next.js 14.2.4 to address the following vulnerabilities:
  - CVE-2025-29927 (9.1) - Authorization Bypass in Next.js Middleware
  - CVE-2024-46982 (7.5) - Authorization Bypass Through User-Controlled Key
  - CVE-2024-51479 (7.5) - Authorization bypass in Next.js
  - CVE-2024-47831 (5.9) - Uncontrolled Recursion
  - CVE-2024-56332 (5.3) - Next.js Vulnerable to Denial of Service (DoS) with Server Actions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/enhancement`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/enhancement`)
5. Submit a Pull Request

## License

This project is proprietary software of Aydo Intergalactic Corporation. All rights reserved. 
