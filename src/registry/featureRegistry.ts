import type { FeatureDefinition, ToolCategoryId } from './types';

class FeatureRegistry {
  private features: Map<string, FeatureDefinition> = new Map();

  public register(feature: FeatureDefinition): void {
    if (this.features.has(feature.id)) {
      console.warn(`Feature with ID "${feature.id}" is already registered. Overwriting.`);
    }
    this.features.set(feature.id, feature);
  }

  public registerAll(featureList: FeatureDefinition[]): void {
    featureList.forEach((f) => this.register(f));
  }

  public getAll(): FeatureDefinition[] {
    return Array.from(this.features.values()).sort((a, b) => a.order - b.order);
  }

  public getById(id: string): FeatureDefinition | undefined {
    return this.features.get(id);
  }

  public getByRoute(route: string): FeatureDefinition | undefined {
    const normalized = route.toLowerCase().replace(/\/+$/, '');
    return Array.from(this.features.values()).find(
      (f) => f.route.toLowerCase().replace(/\/+$/, '') === normalized
    );
  }

  public getByCategory(category: ToolCategoryId): FeatureDefinition[] {
    return this.getAll()
      .filter((f) => f.category === category)
      .sort((a, b) => a.order - b.order);
  }

  public search(query: string): FeatureDefinition[] {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return this.getAll().filter((f) => {
      if (!f.searchable) return false;
      return (
        f.name.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q) ||
        f.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        f.category.toLowerCase().includes(q)
      );
    });
  }

  /**
   * Filter features based on user permissions and feature flags
   */
  public getAvailable(
    userPermissions: string[],
    flags: Record<string, boolean>
  ): FeatureDefinition[] {
    const isSuperAdmin = userPermissions.includes('*');

    return this.getAll().filter((f) => {
      // 1. Check feature flag
      if (flags[f.id] === false) return false;

      // 2. Check RBAC permissions
      if (isSuperAdmin) return true;
      if (f.permissions.length === 0) return true;

      // Match if user has category permission or specific feature permission
      const hasPermission = f.permissions.some(
        (perm) =>
          userPermissions.includes(perm) ||
          userPermissions.includes(`category:${f.category}`)
      );
      return hasPermission;
    });
  }
}

export const featureRegistry = new FeatureRegistry();
