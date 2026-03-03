# Portfolio Website

This is a modern, responsive portfolio website built with Next.js and ready for GitHub Pages deployment.

## Getting Started

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment

To deploy the application to GitHub Pages, run:

```bash
npm run deploy
```

This command builds the project and pushes the output to the `gh-pages` branch.

## Customization

- **Content**: Edit `app/page.tsx` to update your information and projects.
- **Styles**: Edit `app/globals.css` and `app/page.module.css` to change colors and fonts.
- **Config**: `next.config.ts` is configured for static export (`output: 'export'`).
