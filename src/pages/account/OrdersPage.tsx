import { useState } from 'react';
import { getProduct } from '@/content/catalog';
import { site } from '@/content/site';
import { useStore } from '@/store/StoreProvider';
import { ProductArt } from '@/components/product/ProductArt';
import { Icon } from '@/components/ui/Icon';
import { DemoNote, EmptyState } from '@/components/ui/primitives';
import { cx, formatAmount, formatDate, formatInt } from '@/lib/format';
import { usePageTitle } from '@/lib/usePageTitle';

/** one row per purchased line, newest order first */
export default function OrdersPage() {
  const title = site.account.tabs[1].label;
  usePageTitle(title);
  const { orders } = useStore();
  const [q, setQ] = useState('');
  const cur = site.locale.currency.symbol;

  if (!orders.length) return <EmptyState icon="receipt" title="لا توجد عمليات شراء بعد" action={{ label: 'الفئات', to: '/categories' }} />;

  const rows = orders.flatMap((o) => o.lines.map((l, i) => ({ key: `${o.id}-${i}`, order: o, line: l, product: getProduct(l.slug) })));
  const needle = q.trim().toLowerCase();
  const shown = needle
    ? rows.filter(({ order, line }) => `${line.name} ${order.id} ${line.playerId ?? ''}`.toLowerCase().includes(needle))
    : rows;
  const qtyLabel = (n: number) => (n === 1 ? 'منتج واحد' : `${formatInt(n)} منتجات`);

  return (
    <section aria-labelledby="orders-title" className="game-frame game-frame-lg acct-sage p-4 sm:p-8">
      <h2 id="orders-title" className="text-center font-display text-2xl font-extrabold text-fg md:text-3xl">{title}</h2>

      {/* search: filters by product name, order number or player id */}
      <label className="orders-search relative mx-auto mt-6 flex h-12 max-w-xl items-center gap-3 rounded-full pe-2 ps-4">
        <Icon name="search" size={18} className="shrink-0 opacity-60" />
        <span className="sr-only">ابحث في عمليات الشراء</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث باسم المنتج أو رقم الطلب…" className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60" />
        {q ? (
          <button type="button" onClick={() => setQ('')} aria-label="مسح البحث" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#11231A]/10 transition-colors hover:bg-[#11231A]/20"><Icon name="x" size={14} /></button>
        ) : (
          <span className="num shrink-0 rounded-full bg-[#11231A]/10 px-3 py-1 text-xs opacity-80">{shown.length}</span>
        )}
      </label>

      {shown.length === 0 && (
        <p className="mt-8 text-center text-sm opacity-70">{`لا توجد نتائج لـ "${q.trim()}"`}</p>
      )}

      {/* ——— table (tablet and up) ——— */}
      <div className={cx('orders-panel mt-5 hidden overflow-hidden rounded-2xl', shown.length > 0 && 'md:block')}>
        <table className="w-full text-center text-sm">
          <thead>
            <tr className="bg-[#11231A] text-[13px] font-semibold text-white">
              <th scope="col" className="w-[110px] px-4 py-3.5 font-semibold">المنتج</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">اسم المنتج</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">رقم الطلب</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">العدد</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">التاريخ</th>
              <th scope="col" className="px-4 py-3.5 font-semibold">السعر</th>
            </tr>
          </thead>
          <tbody className="orders-body">
            {shown.map(({ key, order, line, product }, i) => (
              <tr key={key} className="anim-rise transition-colors hover:bg-fg/[.025]" style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}>
                <td className="px-4 py-3">
                  {product && <ProductArt product={product} sizes="56px" className="mx-auto h-14 w-14 rounded-xl ring-1 ring-line" />}
                </td>
                <td className="px-4 py-3 font-medium text-fg/90">
                  {line.name}
                  {line.playerId && <span className="mt-0.5 block text-[11px] text-muted">معرف اللاعب: <span className="num">{line.playerId}</span></span>}
                </td>
                <td className="num px-4 py-3 font-mono text-[13px] text-muted">{order.id}</td>
                <td className="px-4 py-3 text-muted">{qtyLabel(line.qty)}</td>
                <td className="px-4 py-3 text-muted">{formatDate(order.createdAt)}</td>
                <td className="num px-4 py-3 font-bold text-fg">{formatAmount(line.price * line.qty)} {cur}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ——— stacked rows (phones) ——— */}
      <ul className="mt-6 grid gap-3 md:hidden">
        {shown.map(({ key, order, line, product }, i) => (
          <li key={key} className="anim-rise orders-panel rounded-2xl p-3" style={{ animationDelay: `${Math.min(i, 10) * 60}ms` }}>
            <div className="flex items-start gap-3">
              {product && <ProductArt product={product} sizes="64px" className="h-16 w-16 shrink-0 rounded-xl ring-1 ring-line" />}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[15px] font-semibold leading-6 text-fg">{line.name}</p>
                {line.playerId && <p className="text-[11px] text-muted">معرف اللاعب: <span className="num">{line.playerId}</span></p>}
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-[#11231A]/10 pt-3 text-center">
              <div className="min-w-0">
                <dt className="text-[10px] text-muted">رقم الطلب</dt>
                <dd className="num mt-0.5 truncate font-mono text-[11px] font-medium text-fg/85" dir="ltr">{order.id}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] text-muted">التاريخ</dt>
                <dd className="mt-0.5 truncate text-[11px] font-medium text-fg/85">{formatDate(order.createdAt)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[10px] text-muted">العدد</dt>
                <dd className="mt-0.5 truncate text-[11px] font-medium text-fg/85">{qtyLabel(line.qty)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-[#11231A] px-3.5 py-2.5 text-white">
              <span className="text-xs text-white/70">الإجمالي</span>
              <span className="num text-base font-bold">{formatAmount(line.price * line.qty)} <span className="text-xs font-medium text-white/70">{cur}</span></span>
            </div>
          </li>
        ))}
      </ul>

      <DemoNote className="mt-6 justify-center">الطلبات المعروضة ناتجة عن العرض التجريبي ومحفوظة في هذا المتصفح فقط.</DemoNote>
    </section>
  );
}
