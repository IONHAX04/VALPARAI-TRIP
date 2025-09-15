# **App Name**: Valparai Ledger

## Core Features:

- User Authentication: Secure user login via Firebase Authentication (email/password).
- Trip Details Input: Authorized users can add/edit trip details (places, timestamp, budget).
- Member Management: Add and manage trip members (name, role). Track amounts given, timestamp, and purpose of contribution.
- Dashboard Overview: Display overall budget, amount given logs, remaining budget, and individual contributions.
- Chart Generation Tool: Use overall budget and individual expenses records as a tool to automatically generate relevant charts using recharts or primereact based on available data to enhance dashboard data visualization.
- Public Read-Only View: Display trip details, budget, member count, and amount given, without login.

## Style Guidelines:

- Primary color: A desaturated, calm green (#A7D1AB) to evoke feelings of nature and tranquility, reflecting the trip destination.
- Background color: A light, off-white (#F5F5F5), aligning with the chosen light color scheme, providing a clean backdrop that lets the data take center stage.
- Accent color: A soft, contrasting blue (#7ECA9F) that complements the primary green, while having a sufficient distance on the color wheel. It's also a little brighter and more saturated, adding vibrancy to the user interface.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines, providing a modern and slightly techy feel, paired with 'Inter' (sans-serif) for body text, which offers excellent readability and a neutral tone. Code font: 'Source Code Pro' for displaying code snippets.
- Mobile-first design using cards and stacked UI elements. Grid layout for tablets and web, ensuring responsiveness.
- Consistent use of simple, outline-style icons to represent trip details, members, and expenses. This adds visual clarity without cluttering the interface.
- Subtle transitions and animations when navigating between pages or updating data, providing a smooth user experience.