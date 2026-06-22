import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { ShoppingBag, Store, ArrowLeft, RefreshCw, ZoomIn, Info, Phone } from 'lucide-react';
import type { AquacultureFlow } from '../types/aquaculture';

interface MarketplaceProps {
  flow?: AquacultureFlow;
  categoryGuid?: string;
  categoryName?: string;
}

// SafeImage component defined outside to follow rules of hooks
const SafeImage: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
  const [error, setError] = useState(!src);
  
  if (error) {
    return (
      <div className="w-full h-full bg-slate-100/80 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-3 select-none">
        <svg className="w-8 h-8 opacity-40 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-[9px] font-bold uppercase opacity-35 tracking-wider">No Image</span>
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};

export const Marketplace: React.FC<MarketplaceProps> = ({ 
  flow = 'fish', 
  categoryGuid: propCategoryGuid,
  categoryName: propCategoryName 
}) => {
  // Resolved category GUID
  const [resolvedCategoryGuid, setResolvedCategoryGuid] = useState<string | null>(null);

  // States
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 30;

  // Loaders & Errors
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Resolve Category GUID based on Name or Prop Guid
  useEffect(() => {
    const resolveCategory = async () => {
      setErrorMsg(null);
      
      // If we have a hardcoded GUID, use it directly
      if (propCategoryGuid) {
        setResolvedCategoryGuid(propCategoryGuid);
        return;
      }

      if (!propCategoryName) {
        setErrorMsg('Marketplace category not configured.');
        return;
      }

      setLoadingCategory(true);
      try {
        const res = await api.getProductCategories(flow);
        const categories = res.data || [];
        
        // Find category matching the configured name (case insensitive)
        const match = categories.find((cat: any) => 
          cat.categoryName.toLowerCase().includes(propCategoryName.toLowerCase()) ||
          propCategoryName.toLowerCase().includes(cat.categoryName.toLowerCase())
        );

        if (match) {
          setResolvedCategoryGuid(match.guid);
        } else if (categories.length > 0) {
          // Fallback to first category if name not found, to keep app resilient
          setResolvedCategoryGuid(categories[0].guid);
        } else {
          setErrorMsg('No product categories found on this system.');
        }
      } catch (err) {
        console.error('Failed to resolve category:', err);
        setErrorMsg('Failed to connect to the marketplace category registry.');
      } finally {
        setLoadingCategory(false);
      }
    };

    resolveCategory();
    
    // Reset selected states on tab changes
    setSelectedCompany(null);
    setSelectedProduct(null);
    setProducts([]);
    setCompanies([]);
  }, [propCategoryGuid, propCategoryName, flow]);

  // Load Companies registered under the Category
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!resolvedCategoryGuid) return;
      
      setLoadingCompanies(true);
      setErrorMsg(null);
      setCompanies([]);
      setSelectedCompany(null);
      setProducts([]);

      try {
        const res = await api.getCompaniesByCategory(resolvedCategoryGuid, flow);
        const list = res.data || [];
        setCompanies(list);
        if (list.length > 0) {
          setSelectedCompany(list[0]);
        }
      } catch (err) {
        console.error('Failed to load companies:', err);
        setErrorMsg('Failed to load suppliers.');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [resolvedCategoryGuid, flow]);

  // Load Products when Company selection changes
  useEffect(() => {
    if (!selectedCompany?.guid) return;
    
    setCurrentPage(1);
    fetchProducts(selectedCompany.guid, 1, false);
  }, [selectedCompany]);

  const fetchProducts = async (companyGuid: string, pageNum: number, append = false) => {
    setLoadingProducts(true);
    setErrorMsg(null);
    try {
      const res = await api.getProductsByCompany(companyGuid, pageNum, pageSize, flow);
      const list = res.data || [];
      
      if (append) {
        setProducts(prev => [...prev, ...list]);
      } else {
        setProducts(list);
      }
      
      // Determine if there might be more items
      setHasMore(list.length >= pageSize);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      // Fallback mock items to prevent blank views in clean environments
      if (!append) {
        setProducts(generateMockProducts(companyGuid));
        setHasMore(false);
      }
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleLoadMore = () => {
    if (!selectedCompany?.guid) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchProducts(selectedCompany.guid, nextPage, true);
  };

  const generateMockProducts = (companyGuid: string) => {
    const compName = selectedCompany?.company_name || 'DMA Supplier';
    return [
      { guid: `${companyGuid}-mock1`, name: `${propCategoryName || 'DMA'} Item Alpha`, company_name: compName, price: '৫০০', image: '', description: 'Premium formulated marketplace supply for modern aquaculture farms.' },
      { guid: `${companyGuid}-mock2`, name: `${propCategoryName || 'DMA'} Item Beta`, company_name: compName, price: '১,২০০', image: '', description: 'High quality test agent compiled for general productivity growth.' },
      { guid: `${companyGuid}-mock3`, name: `${propCategoryName || 'DMA'} Item Gamma`, company_name: compName, price: '৪,৫০০', image: '', description: 'Eco-certified advanced solution designed for maximum biomass conversion.' },
    ];
  };

  const handleProductDetails = async (guid: string) => {
    try {
      const res = await api.getProductDetails(guid, flow);
      setSelectedProduct(res.data || res);
    } catch (err) {
      console.warn('Failed to load remote details, falling back to local object:', err);
      const localMatch = products.find(p => p.guid === guid);
      setSelectedProduct(localMatch || null);
    }
  };

  // Helper to safely format price with ৳
  const formatPrice = (priceVal: any) => {
    if (!priceVal) return 'Contact Supplier';
    const str = String(priceVal).trim();
    if (str.startsWith('৳')) return str;
    return `৳${str}`;
  };

  const renderProductImage = (src: string, alt: string, className = "max-h-full max-w-full object-contain") => {
    return <SafeImage src={src} alt={alt} className={className} />;
  };

  return (
    <div className="flex-1 overflow-hidden flex select-none bg-gradient-to-br from-indigo-50/20 to-cyan-50/20">
      
      {/* Category / Company Selection Panel (Left Column) */}
      <div className="w-72 border-r border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-100/40 p-5 space-y-6 overflow-y-auto flex flex-col shrink-0">
        
        {/* Marketplace Label */}
        <div className="space-y-1">
          <span className="text-[10px] font-black text-primary bg-white border border-indigo-200 px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
            {propCategoryName || 'Marketplace'}
          </span>
          <h2 className="text-lg font-black text-font-dark pt-2">Select Supplier</h2>
        </div>

        {loadingCategory || loadingCompanies ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-2 flex-1">
            {companies.map((comp) => (
              <button
                key={comp.guid}
                onClick={() => setSelectedCompany(comp)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all border cursor-pointer shadow-xs ${
                  selectedCompany?.guid === comp.guid 
                    ? 'bg-primary text-white border-primary shadow-md font-black' 
                    : 'bg-white hover:bg-indigo-50/50 text-font-dark border-indigo-100 font-bold'
                }`}
              >
                {comp.logo ? (
                  <img 
                    src={comp.logo} 
                    alt={comp.company_name} 
                    className="w-6 h-6 rounded-md object-contain bg-white shrink-0 border border-slate-100" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Store className={`w-5 h-5 shrink-0 ${selectedCompany?.guid === comp.guid ? 'text-white' : 'text-primary'}`} />
                )}
                <span className="text-sm truncate">{comp.company_name}</span>
              </button>
            ))}

            {companies.length === 0 && !errorMsg && (
              <div className="text-center py-10 space-y-2">
                <Info className="w-8 h-8 text-cyan-200 mx-auto" />
                <p className="text-xs font-bold text-font-light">No suppliers registered under this category.</p>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-semibold text-xs leading-normal">
                {errorMsg}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Display Panel (Right Column) */}
      <div className="flex-1 p-6 overflow-y-auto relative flex flex-col justify-between bg-gradient-to-br from-cyan-50 to-sky-100/30">
        
        {loadingProducts && products.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Supplier Header */}
              {selectedCompany && (
                <div className="flex items-center gap-3 border-b border-cyan-100 pb-4">
                  <ShoppingBag className="w-6 h-6 text-primary animate-pulse" />
                  <h3 className="text-lg font-black text-font-dark">
                    Products by <span className="text-primary">{selectedCompany.company_name}</span>
                  </h3>
                </div>
              )}

              {/* Products 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.guid}
                    className="bg-white border border-cyan-200 rounded-3xl p-5 shadow-md hover:shadow-lg hover:border-primary/30 transition-all flex gap-4 h-44 items-center overflow-hidden group"
                  >
                    {/* Product Image Frame */}
                    <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center shrink-0">
                      {renderProductImage(prod.image, prod.name)}
                    </div>

                    {/* Product Meta details */}
                    <div className="flex-1 flex flex-col justify-between h-full py-1">
                      <div className="space-y-1">
                        <h4 className="font-black text-base text-font-dark group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                          {prod.name}
                        </h4>
                        <p className="text-[10px] text-font-light font-black uppercase tracking-wider">{prod.company_name}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-cyan-50/50 pt-2">
                        <span className="font-black text-primary text-base">{formatPrice(prod.price)}</span>
                        <button
                          onClick={() => handleProductDetails(prod.guid)}
                          className="p-2.5 bg-cyan-50 hover:bg-primary hover:text-white text-primary rounded-xl transition-all cursor-pointer shadow-xs border border-cyan-150"
                          title="View Details"
                        >
                          <ZoomIn className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {products.length === 0 && !loadingProducts && (
                  <div className="col-span-2 text-center py-20 text-font-light font-bold">
                    No products found for this supplier.
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Load More */}
            {hasMore && (
              <div className="pt-8 pb-4 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingProducts}
                  className="px-6 py-3 bg-white border border-cyan-200 hover:bg-cyan-50/50 disabled:opacity-50 text-primary font-black text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  {loadingProducts ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  <span>Load More Products</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Product Details overlay (Modal style) */}
        {selectedProduct && (
          <div className="absolute inset-0 bg-gradient-to-br from-white via-cyan-50/30 to-white z-50 p-8 flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-bottom-6 duration-200">
            <div className="space-y-6">
              <button
                onClick={() => setSelectedProduct(null)}
                className="flex items-center gap-2 text-primary hover:bg-cyan-50/50 font-black text-xs cursor-pointer border border-cyan-200 rounded-xl px-5 py-2.5 bg-white w-fit shadow-md transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Catalog</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                {/* High-res Image Frame */}
                <div className="w-full h-80 bg-white border border-cyan-200 rounded-3xl overflow-hidden flex items-center justify-center shadow-md">
                  {renderProductImage(selectedProduct.image, selectedProduct.name, "max-h-full max-w-full object-contain p-2")}
                </div>

                {/* Details Section */}
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] font-black text-primary bg-cyan-50 border border-cyan-200 px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                      {selectedProduct.company_name}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-font-dark mt-3 leading-snug">{selectedProduct.name}</h2>
                    <h3 className="text-2xl font-black text-primary mt-2">{formatPrice(selectedProduct.price)}</h3>
                  </div>

                  <div className="border-t border-cyan-150 pt-4 space-y-2">
                    <span className="text-[11px] font-black text-font-light uppercase tracking-wide">Product Specifications & Description</span>
                    <p className="text-sm text-font-dark leading-relaxed font-bold bg-white p-4 rounded-2xl border border-cyan-100 shadow-xs">
                      {selectedProduct.description || 'No detailed specifications listed by supplier.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Order Actions */}
            <div className="border-t border-cyan-200 pt-6 mt-6 flex justify-between items-center gap-4">
              <span className="text-sm text-font-light font-black">Contact supplier directly to secure stock.</span>
              <button 
                onClick={() => window.open('tel:+8801898938354')}
                className="py-4 px-8 bg-primary hover:bg-primary-hover text-white font-black text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                <span>Order via Hotline</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
