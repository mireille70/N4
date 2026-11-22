import { Link } from 'react-router-dom';
import { usePageTitle } from '@/lib/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('الصفحة غير موجودة');
  return (
    <section className="container-x grid min-h-[60vh] place-items-center py-section text-center">
      <div>
        <p className="num font-display text-[7rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(var(--c-accent))] md:text-[11rem]">404</p>
        <h1 className="mt-6 text-2xl font-bold md:text-3xl">الصفحة غير موجودة</h1>
        <Link to="/" className="btn btn-primary mt-8">الرئيسية</Link>
      </div>
    </section>
  );
}
