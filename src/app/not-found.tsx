import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf6ee] px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#e28800]">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-[#100f0d]">Page not found</h2>
        <p className="mt-2 text-[#5e5b52]">
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-[#e28800] px-6 py-3 font-bold text-white transition-colors hover:bg-[#c97300]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
