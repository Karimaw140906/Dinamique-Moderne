import { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";
import { usePageConfig } from "@/lib/usePageConfig";
import { useCatalogues } from "@/lib/useCatalogues";
import { useDeviceType } from "@/lib/useDeviceType";
import { resolveLayout } from "./layoutRegistry";

interface CataloguesSectionProps {
  pageSlug: string;
  title?: string;
  subtitle?: string;
}

interface CataloguesErrorBoundaryState {
  hasError: boolean;
}

class CataloguesErrorBoundary extends Component<
  { children: ReactNode },
  CataloguesErrorBoundaryState
> {
  state: CataloguesErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): CataloguesErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Catalogues section failed to render", error, info.componentStack);
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

function CataloguesSectionContent({ pageSlug, title, subtitle }: CataloguesSectionProps) {
  const { config } = usePageConfig(pageSlug);
  const { catalogues, loading } = useCatalogues(pageSlug);
  const device = useDeviceType();

  const validCatalogues = Array.isArray(catalogues)
    ? catalogues.filter((catalogue) => catalogue && typeof catalogue.id === "string")
    : [];

  if (loading || validCatalogues.length === 0) return null;

  const responsiveKey = config?.layout_responsive?.[device];
  const effectiveLayoutKey = responsiveKey || config?.layout_key || "grid_classic";
  const LayoutComponent = resolveLayout(effectiveLayoutKey);

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {(title || subtitle) && (
          <div className="text-center mb-8 md:mb-10">
            <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              {title && (
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif italic font-bold text-gray-900">
                  {title}
                </h2>
              )}
              {subtitle && <p className="text-gray-500 text-sm sm:text-base mt-2 max-w-md mx-auto">{subtitle}</p>}
            </motion.div>
          </div>
        )}

        <LayoutComponent catalogues={validCatalogues} layoutProps={config?.layout_props} />
      </div>
    </section>
  );
}

export function CataloguesSection(props: CataloguesSectionProps) {
  return (
    <CataloguesErrorBoundary>
      <CataloguesSectionContent {...props} />
    </CataloguesErrorBoundary>
  );
}
