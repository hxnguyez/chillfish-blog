// This is a simple text file that provides information about the humans who created this website.
// It is meant to be read by other humans, and not by machines.
// If you need more information about this file, you can go to https://humanstxt.org/ for more details.
import config from "@shConfig";
import type { APIRoute } from "astro";

// Edit the content of this file to provide information about yourself and your website.
// You can also add more sections if you want, such as "Contact", "Social Media", "Projects", etc.
// Just make sure to follow the format and keep it human-readable.
// If you don't mind, I would really appreciate it if you could keep some information about SHBlog Next.
// This will help me to promote the project and attract more users, which will in turn help me to improve the project and add more features in the future.
//
// Anyway, thank you for using SHBlog Next, and I hope you enjoy it.
// Edit this file with your own information, and have fun building your website!
const humansTxt = `
/* TEAM */
	Developer: Your Name (Or your nickname)
	Site: your-portfolio-link.com
	Twitter: @your_handle
	GitHub: https://github.com/yourusername
	Location: Taipei, Taiwan

/* THANKS */
	/* You can write something here to thank people who contributed to the website, such as open source projects, libraries, or individuals who helped you. */
	/* Uhhh...like...the author who made this theme? */

/* SITE */
	Last update: ${new Date().toISOString().split("T")[0].replaceAll("-", "/")}
	Language: ${config.lang}
	Theme: SHBlog Next
	Framework: Astro
	UI Library: React
	Styling: Tailwind CSS
	Components: shadcn/ui (Radix UI primitives)
	Icons: Lucide React
	Typography: Inter, Noto Sans TC
	Standards: HTML5, CSS3, TypeScript
	Software: VS Code, Prettier

/* THANKS */
	Astro Community: For the incredible performance and DX.
	shadcn: For the beautiful, accessible UI components.
	Open Source: To everyone contributing to the web ecosystem.
	SHBlog Next: For being an amazing starter theme that made this project possible.

/* NOTE */
	/* You can write something here to provide additional information about the website, such as the purpose of the website, the technologies used, or any other relevant information that you want to share with your visitors. */
	/* For example, you can write something like "This website is a personal portfolio that showcases my projects and skills as a developer. It is built using Astro, React, and Tailwind CSS, and it is designed to be fast, responsive, and accessible." */
`;

export const GET: APIRoute = () => {
  return new Response(humansTxt);
};
