import { useEffect, useState } from 'react';
import { Hero } from '@/components/home/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { BrandShowcase } from '@/components/home/BrandShowcase';
import { FeaturedRow } from '@/components/home/FeaturedRow';
import { StoryProductCarousel } from '@/components/home/StoryProductCarousel';
import { InstagramGrid } from '@/components/home/InstagramGrid';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertTriangle } from 'lucide-react';
import { fetchBanners, fetchCategories, fetchBrands, fetchProducts, fetchInstagramPosts } from '@/services/catalog';
import type { Banner, Category, Brand, Product, InstagramPost } from '@/types';

export function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);

  useEffect(() => {
    Promise.all([fetchBanners(), fetchCategories(), fetchBrands(), fetchProducts(), fetchInstagramPosts()])
      .then(([banners, cats, brandList, allProducts, posts]) => {
        setBanner(banners[0] ?? null);
        setCategories(cats);
        setBrands(brandList);
        setProducts(allProducts);
        setInstagramPosts(posts);
      })
      .catch(err => {
        console.error('Falha ao carregar a Home:', err);
        setError('Não foi possível carregar a loja agora. Verifique sua conexão e tente novamente em instantes.');
      })
      .finally(() => setLoading(false));
  }, []);

  const onHome = products.filter(p => p.show_on_home);
  const newInDrop = onHome.filter(p => p.is_new);
  // "Recém-chegaram": os produtos mais recentes por data de cadastro, sem depender do estoque estar em destaque.
  const recentArrivals = [...products]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);
  const featured = onHome.filter(p => p.is_featured);
  const bestSellers = onHome.filter(p => p.is_best_seller);
  // "Últimas peças": estoque total baixo o suficiente para criar senso de exclusividade (Seção 20 do briefing original).
  const lastPieces = products.filter(p => {
    const total = p.variants.reduce((sum, v) => sum + v.stock, 0);
    return total > 0 && total <= p.low_stock_threshold + 2;
  });
  const onSale = onHome.filter(p => p.is_sale);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        <ProductGridSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState icon={AlertTriangle} title="Algo deu errado" description={error} />
      </div>
    );
  }

  return (
    <div>
      <Hero banner={banner} />
      <CategoryGrid categories={categories} />
      <BrandShowcase brands={brands} />
      <FeaturedRow eyebrow="Chegaram agora" title="Novos na DROP" products={newInDrop} seeAllHref="/produtos?filtro=novos" />
      <FeaturedRow eyebrow="Direto do estoque" title="Recém-chegaram" products={recentArrivals} seeAllHref="/produtos" />
      <FeaturedRow eyebrow="Curadoria" title="Em Destaque" products={featured} seeAllHref="/produtos?filtro=destaque" />
      <FeaturedRow eyebrow="A galera aprovou" title="Mais Vendidos" products={bestSellers} seeAllHref="/produtos?filtro=mais-vendidos" />
      <StoryProductCarousel products={onHome} />
      <FeaturedRow eyebrow="Senso de exclusividade" title="Últimas Peças" products={lastPieces} seeAllHref="/produtos" />
      <FeaturedRow eyebrow="Por tempo limitado" title="Ofertas" products={onSale} seeAllHref="/produtos?filtro=ofertas" />
      <InstagramGrid posts={instagramPosts} />
    </div>
  );
}
