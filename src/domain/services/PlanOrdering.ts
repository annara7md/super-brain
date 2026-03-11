import { WorkItem } from "../models/plan-artifacts";

export function orderWorkItems(items: WorkItem[]): WorkItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const visited = new Set<string>();
  const visiting = new Set<string>();
  const result: WorkItem[] = [];

  const visit = (item: WorkItem): void => {
    if (visited.has(item.id)) return;
    if (visiting.has(item.id)) return;
    visiting.add(item.id);

    const dependencies = [...item.dependencies].sort();
    for (const depId of dependencies) {
      const dep = byId.get(depId);
      if (dep) visit(dep);
    }

    visiting.delete(item.id);
    visited.add(item.id);
    result.push(item);
  };

  [...items]
    .sort((a, b) => a.priority - b.priority || a.title.localeCompare(b.title))
    .forEach(visit);

  return result;
}
